const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'https://refit.team').replace(/\/$/, '');

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

function errorMessage(status, payload) {
    if (status === 401) return '로그인이 필요하거나 만료되었습니다. 다시 로그인해주세요.';
    if (status === 403) return '이 수업에 접근하거나 변경할 권한이 없습니다.';
    return payload?.error?.message || payload?.message || `요청에 실패했습니다. (${status})`;
}

/** Handles both raw classroom responses and the { success, data, error } envelope. */
export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
    const headers = { Accept: 'application/json' };
    const token = globalThis.localStorage?.getItem('accessToken') || globalThis.localStorage?.getItem('token');
    if (token) headers.Authorization = `Bearer ${token.replace(/^Bearer\s+/i, '')}`;

    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            credentials: 'include',
            signal,
            ...(body === undefined ? {} : { body: isForm ? body : JSON.stringify(body) }),
        });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new ApiError('서버에 연결할 수 없습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
    }

    const text = await response.text();
    let payload = null;
    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            throw new ApiError('서버 응답을 읽을 수 없습니다. 잠시 후 다시 시도해주세요.', response.status);
        }
    }

    if (!response.ok) throw new ApiError(errorMessage(response.status, payload), response.status);
    if (payload && typeof payload.success === 'boolean') {
        if (!payload.success) {
            const status = payload.error?.status || response.status;
            throw new ApiError(errorMessage(status, payload), status);
        }
        return payload.data;
    }
    return payload;
}
