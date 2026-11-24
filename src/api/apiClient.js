// .env의 VITE_API_BASE_URL을 읽어오며, 미설정 시 Vite /api 프록시를 사용합니다.
const BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const AUTH_REQUESTS_WITHOUT_REFRESH = new Set([
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/google/login',
    '/api/auth/google/register',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/user/email/send-code',
    '/api/user/email/verify-code',
]);

export function shouldSkipAuthRefresh(path) {
    return AUTH_REQUESTS_WITHOUT_REFRESH.has(path.split('?')[0]);
}

function formatErrorMessage(status, payload) {
    if (status === 401) return '로그인이 필요하거나 만료되었습니다. 다시 로그인해주세요.';
    if (status === 403) return '이 수업에 접근하거나 변경할 권한이 없습니다.';
    return payload?.error?.message || payload?.message || `요청에 실패했습니다. (${status})`;
}

// 동시에 여러 요청이 401을 받아도 /api/auth/refresh는 한 번만 호출하도록 공유
let refreshPromise = null;

async function parseResponsePayload(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

export async function refreshAuthToken() {
    if (!refreshPromise) {
        refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'X-Client': 'web' },
            credentials: 'include',
        })
            .then((res) => {
                if (!res.ok) {
                    throw new ApiError(`토큰 갱신 실패 (${res.status})`, res.status);
                }
                return true;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

export async function logoutAuthApi() {
    await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'X-Client': 'web' },
        credentials: 'include',
    });
}

/**
 * teacher / student 공통 API 요청 함수
 * - HttpOnly 쿠키 인증(credentials: 'include') 및 X-Client: web 헤더 자동 포함
 * - 401 응답 시 /api/auth/refresh로 쿠키 갱신 후 1회 재시도
 * - { success, data, error } 래퍼와 일반 JSON 응답 모두 지원
 */
export async function apiRequest(
    path,
    { method = 'GET', params, body, signal, skipAuthRefresh = false } = {}
) {
    const query = params
        ? new URLSearchParams(
              Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          ).toString()
        : '';
    const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;

    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = {
        Accept: 'application/json',
        'X-Client': 'web',
    };
    if (body !== undefined && !isForm) {
        headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
        method,
        headers,
        credentials: 'include',
        signal,
        ...(body === undefined ? {} : { body: isForm ? body : JSON.stringify(body) }),
    };

    let response;
    try {
        response = await fetch(url, fetchOptions);
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        throw new ApiError('서버에 연결할 수 없습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
    }

    // Access Token 만료(401) 시 /api/auth/refresh로 쿠키 갱신 후 1회 재시도
    if (response.status === 401 && !skipAuthRefresh && !shouldSkipAuthRefresh(path)) {
        try {
            await refreshAuthToken();
            response = await fetch(url, fetchOptions);
        } catch {
            // refresh 실패 시 아래 공통 에러 처리로 전달
        }
    }

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
        throw new ApiError(formatErrorMessage(response.status, payload), response.status);
    }

    if (payload && typeof payload.success === 'boolean') {
        if (!payload.success) {
            const status = payload.error?.status || response.status;
            throw new ApiError(formatErrorMessage(status, payload), status);
        }
        return payload.data;
    }

    return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}

export const apiClient = {
    get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
    post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};

export default apiClient;
