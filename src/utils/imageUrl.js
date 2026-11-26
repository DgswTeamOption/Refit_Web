const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

const IMAGE_URL_FIELDS = [
    'profileImageUrl',
    'profile_image_url',
    'profileImage',
    'profile_image',
    'bannerImageUrl',
    'banner_image_url',
    'imageUrl',
    'image_url',
    'fileUrl',
    'file_url',
    'url',
    'src',
];

function findImageUrl(value, visited = new Set()) {
    if (typeof value === 'string') return value.trim();
    if (!value || typeof value !== 'object' || visited.has(value)) return '';

    visited.add(value);
    for (const field of IMAGE_URL_FIELDS) {
        const imageUrl = findImageUrl(value[field], visited);
        if (imageUrl) return imageUrl;
    }
    return '';
}

/** Convert API image values to browser-loadable URLs. */
export function resolveImageUrl(value) {
    const imageUrl = findImageUrl(value);
    if (!imageUrl || /^(data|blob):/i.test(imageUrl)) return imageUrl;

    const pageOrigin = typeof window === 'undefined' ? '' : window.location.origin;
    const baseUrl = API_BASE_URL || pageOrigin || 'http://localhost';

    try {
        const resolved = new URL(imageUrl, baseUrl);
        const isLoopback = ['localhost', '127.0.0.1', '0.0.0.0'].includes(resolved.hostname);

        // The server's default file.base-url is localhost:8080. In the browser,
        // use the configured API host (or the current host when using the Vite proxy).
        if (isLoopback && resolved.pathname.startsWith('/uploads/') && pageOrigin) {
            const imageOrigin = API_BASE_URL || pageOrigin;
            return new URL(`${resolved.pathname}${resolved.search}${resolved.hash}`, imageOrigin).toString();
        }

        return resolved.toString();
    } catch {
        return imageUrl;
    }
}
