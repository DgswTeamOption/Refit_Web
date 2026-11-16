const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://refit.team').replace(/\/+$/, '');

function buildUrl(path, params) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${API_BASE_URL}${normalizedPath}`);

    if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.append(key, String(value));
            }
        });
    }

    return url.toString();
}

export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export async function apiRequest(path, options = {}) {
    const {
        method = 'GET',
        params,
        body,
        headers: customHeaders = {},
        signal,
    } = options;

    const token = typeof window !== 'undefined'
        ? (localStorage.getItem('accessToken') || localStorage.getItem('token'))
        : null;

    const headers = {
        ...customHeaders,
    };

    if (body !== undefined && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(path, params), {
        method,
        headers,
        body: body === undefined
            ? undefined
            : (body instanceof FormData ? body : JSON.stringify(body)),
        signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

    if (!response.ok) {
        const message = payload?.error?.message || payload?.message || `요청에 실패했습니다. (${response.status})`;
        throw new ApiError(message, response.status, payload);
    }

    if (payload && typeof payload === 'object' && 'success' in payload) {
        if (!payload.success) {
            const message = payload.error?.message || '요청 처리 중 오류가 발생했습니다.';
            throw new ApiError(message, payload.error?.status || response.status, payload);
        }
        return payload.data;
    }

    return payload;
}

export const apiClient = {
    get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
    post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};

export default apiClient;
