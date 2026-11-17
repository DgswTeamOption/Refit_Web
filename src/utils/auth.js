import { jwtDecode } from "jwt-decode";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export async function authApiRequest(path, { method = "POST", body, token } = {}) {
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let requestBody;
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });
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

function readUserId(claims) {
  const value = claims.userId ?? claims.user_id ?? claims.uid ?? claims.id ?? claims.user?.id ?? claims.sub;
  const userId = typeof value === "number" ? String(value) : value;
  return typeof userId === "string" && /^\d+$/.test(userId) ? userId : "";
}

export async function resolveAuthenticatedUser(accessToken) {
  let claims;
  try {
    claims = jwtDecode(accessToken);
  } catch {
    throw new Error("로그인 토큰을 읽을 수 없습니다.");
  }

  let role = normalizeRole(
    claims.role ?? claims.userRole ?? claims.user_role ?? claims.roles ?? claims.authorities ?? claims.authority ?? claims.user?.role ?? claims.realm_access?.roles,
  );
  let name = claims.name ?? claims.userName ?? claims.username ?? claims.preferred_username ?? claims.user?.name ?? "";
  const userId = readUserId(claims);

  if (userId && (!role || !name)) {
    try {
      const profile = await authApiRequest(`/api/users/${userId}`, { method: "GET", token: accessToken });
      role ||= normalizeRole(profile?.role);
      name ||= profile?.name || "";
    } catch (error) {
      if (!role) throw error;
    }
  }

  if (!role) {
    throw new Error("로그인은 완료됐지만 계정 역할을 확인할 수 없습니다.");
  }

  return { role, name };
}

export function saveAuthSession(tokens, { role, name } = {}) {
  if (!tokens?.accessToken) {
    throw new Error("로그인 응답에 accessToken이 없습니다.");
  }

  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.removeItem("refreshToken");
  if (tokens.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.removeItem("token");

  const normalizedRole = normalizeRole(role);
  if (normalizedRole) localStorage.setItem("role", normalizedRole);
  else localStorage.removeItem("role");
  if (name) localStorage.setItem("userName", name);
  else localStorage.removeItem("userName");
}

export function clearAuthSession() {
  ["accessToken", "refreshToken", "token", "role", "userName"].forEach((key) => {
    localStorage.removeItem(key);
  });
}
