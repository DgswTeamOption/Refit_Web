// .env의 VITE_API_BASE_URL을 읽어오며, 미설정 시 Vite /api 프록시를 사용합니다.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

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
                    throw new Error(`토큰 갱신 실패 (${res.status})`);
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

async function request(method, path, { params, body, signal, skipAuthRefresh = false } = {}) {
    const query = params
        ? new URLSearchParams(
              Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          ).toString()
        : '';
    const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;

    const headers = {
        'X-Client': 'web',
    };
    if (body !== undefined && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
        method,
        headers,
        credentials: 'include',
        body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    };

    let response = await fetch(url, fetchOptions);

    // Access Token 만료(401) 시 /api/auth/refresh로 쿠키 갱신 후 1회 재시도
    const isAuthEndpoint =
        path.startsWith('/api/auth/login') ||
        path.startsWith('/api/auth/google/login') ||
        path.startsWith('/api/auth/refresh') ||
        path.startsWith('/api/auth/logout');

    if (response.status === 401 && !skipAuthRefresh && !isAuthEndpoint) {
        try {
            await refreshAuthToken();
            response = await fetch(url, fetchOptions);
        } catch {
            // refresh 실패 시 아래 공통 에러 처리로 전달
        }
    }

    const payload = await parseResponsePayload(response);

    if (!response.ok || payload?.success === false) {
        const error = new Error(
            payload?.error?.message || payload?.message || `요청 실패 (${response.status})`
        );
        error.status = payload?.error?.status || response.status;
        throw error;
    }

    return payload && 'data' in payload ? payload.data : payload;
}

export const apiClient = {
    get: (path, options) => request('GET', path, options),
    post: (path, body, options) => request('POST', path, { ...options, body }),
    put: (path, body, options) => request('PUT', path, { ...options, body }),
    patch: (path, body, options) => request('PATCH', path, { ...options, body }),
    delete: (path, options) => request('DELETE', path, options),
};

export default apiClient;
