// .env의 VITE_API_BASE_URL을 읽어오며, 미설정 시 Vite /api 프록시를 사용합니다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token || null;
};

export const clearAccessToken = () => {
    accessToken = null;
};

async function request(method, path, { params, body, token, signal } = {}) {
    const query = params
        ? new URLSearchParams(
              Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          ).toString()
        : '';
    const url = `${BASE_URL}${path}${query ? `?${query}` : ''}`;

    const headers = {};
    if (body !== undefined && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const authToken = token ?? accessToken;
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

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
