import { apiRequest } from './apiClient.js';

export function queryChatbot({ message, classId, signal }) {
    const text = String(message ?? '').trim();

    if (!text) {
        throw new Error('메시지를 입력해주세요.');
    }

    if (text.length > 200) {
        throw new Error('메시지는 200자 이하로 입력해주세요.');
    }

    const body = { message: text };
    if (/^[1-9]\d*$/.test(String(classId ?? ''))) {
        body.classId = Number(classId);
    }

    return apiRequest('/api/chatbot/query', {
        method: 'POST',
        body,
        signal,
    });
}

export function listChatbotClasses({ signal } = {}) {
    return apiRequest('/api/class', { signal });
}
