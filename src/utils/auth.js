import { logoutAuthApi, refreshAuthToken, shouldSkipAuthRefresh } from "../api/apiClient";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export async function authApiRequest(path, { method = "POST", body, signal, skipAuthRefresh = false } = {}) {
  const headers = new Headers();
  headers.set("X-Client", "web");

  let requestBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const fetchOptions = {
    method,
    headers,
    credentials: "include",
    body: requestBody,
    signal,
  };

  let response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

  if (response.status === 401 && !skipAuthRefresh && !shouldSkipAuthRefresh(path)) {
    try {
      await refreshAuthToken();
      response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
    } catch {
      // refresh 실패 시 원래 401 응답으로 에러 처리
    }
  }

  const responseText = await response.text();
  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
  }

  if (!response.ok || result?.success === false) {
    const isHtmlError = typeof result?.message === "string" && /<\/?(?:html|head|body|title|center|h\d)\b/i.test(result.message);
    const error = new Error(
      result?.error?.message || (isHtmlError ? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." : result?.message) || `요청에 실패했습니다. (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return result && Object.hasOwn(result, "data") ? result.data : result;
}

export function normalizeRole(value) {
  const values = Array.isArray(value) ? value : [value];
  const roleText = values
    .flatMap((item) => {
      if (item && typeof item === "object") {
        return [item.role, item.authority, item.name].filter(Boolean);
      }
      return item == null ? [] : [item];
    })
    .join(" ")
    .toUpperCase();

  if (roleText.includes("TEACHER")) return "teacher";
  if (roleText.includes("STUDENT")) return "student";
  return "";
}

function readUserId(data) {
  if (!data || typeof data !== "object") return "";
  const value = data.userId ?? data.user_id ?? data.uid ?? data.id ?? data.user?.id;
  const userId = typeof value === "number" ? String(value) : value;
  return typeof userId === "string" && /^\d+$/.test(userId) ? userId : "";
}

export async function fetchCurrentUserProfile({ signal } = {}) {
  const endpoints = ["/api/users/me", "/api/auth/me"];
  for (const endpoint of endpoints) {
    try {
      const profile = await authApiRequest(endpoint, { method: "GET", signal });
      if (profile && typeof profile === "object") {
        return profile;
      }
    } catch (error) {
      if (error?.name === "AbortError") throw error;
    }
  }

  const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : "";
  if (storedUserId && /^\d+$/.test(storedUserId)) {
    return authApiRequest(`/api/users/${storedUserId}`, { method: "GET", signal });
  }

  return null;
}

export async function resolveAuthenticatedUser(loginResponse = null) {
  const source = loginResponse && typeof loginResponse === "object" ? loginResponse : {};
  let role = normalizeRole(
    source.role ?? source.userRole ?? source.user_role ?? source.roles ?? source.user?.role,
  );
  let name = source.name ?? source.userName ?? source.username ?? source.user?.name ?? "";
  let userId = readUserId(source);

  if (!role || !name || !userId) {
    const profile = await fetchCurrentUserProfile();
    if (profile) {
      role ||= normalizeRole(profile.role ?? profile.userRole ?? profile.roles);
      name ||= profile.name ?? profile.userName ?? profile.username ?? "";
      userId ||= readUserId(profile);
    }
  }

  return { role, name, userId };
}

export function saveAuthSession({ role, name, userId } = {}) {
  if (typeof window === "undefined") return;

  // HttpOnly 쿠키 인증 방식이므로 브라우저 저장소에는 토큰을 저장하지 않음
  ["accessToken", "refreshToken", "token"].forEach((key) => localStorage.removeItem(key));
  localStorage.setItem("isLoggedIn", "true");

  const normalizedRole = normalizeRole(role);
  if (normalizedRole) localStorage.setItem("role", normalizedRole);
  else localStorage.removeItem("role");

  if (name) localStorage.setItem("userName", name);
  else localStorage.removeItem("userName");

  if (userId) localStorage.setItem("userId", String(userId));
  else localStorage.removeItem("userId");
}

export function isAuthenticatedSession() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isLoggedIn") === "true";
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  ["isLoggedIn", "accessToken", "refreshToken", "token", "role", "userName", "userId"].forEach((key) => {
    localStorage.removeItem(key);
  });
}

export async function logoutAuthSession() {
  try {
    await logoutAuthApi();
  } catch {
    // 서버 로그아웃 실패 시에도 클라이언트 세션 상태는 초기화
  } finally {
    clearAuthSession();
  }
}
