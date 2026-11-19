import { ApiError, apiRequest } from './apiClient.js';
import { mockTeacherRequest } from './teacherMock.js';

// 임시 테스트 데이터: 로그인 연동 후 false로 바꾸면 개발 중에도 실제 API를 사용합니다.
// 배포 빌드에서는 항상 실제 API를 사용합니다.
const USE_TEST_DATA = false;
const teacherRequest = import.meta.env?.DEV && USE_TEST_DATA ? mockTeacherRequest : apiRequest;

function idPath(id) {
    if (!/^[1-9]\d*$/.test(String(id))) {
        throw new ApiError('유효한 수업 또는 공지가 아닙니다. 내 수업에서 다시 선택해주세요.', 400);
    }
    return encodeURIComponent(id);
}

function query(values) {
    return new URLSearchParams(values).toString();
}

function arrayResponse(value) {
    if (!Array.isArray(value)) throw new ApiError('목록 응답 형식이 올바르지 않습니다.');
    return value;
}

export const listClassrooms = ({ signal } = {}) => teacherRequest('/api/class', { signal }).then(arrayResponse);
export const createClassroom = (body) => teacherRequest('/api/class', { method: 'POST', body });
export const deleteClassroom = (id) => teacherRequest(`/api/class/${idPath(id)}`, { method: 'DELETE' });
export const getClassroomHome = (id, { year, month, signal }) =>
    teacherRequest(`/api/class/${idPath(id)}?${query({ year, month })}`, { signal });
export const getMonthlyCalendar = (id, { year, month, signal }) =>
    teacherRequest(`/api/class/calendar/${idPath(id)}?${query({ year, month })}`, { signal }).then(arrayResponse);
export const getAttendanceSummary = (id, { year, month, signal }) =>
    teacherRequest(`/api/class/attendance/stats/${idPath(id)}?${query({ year, month })}`, { signal }).then(arrayResponse);
export const getClassAttendances = (id, date, { signal } = {}) =>
    teacherRequest(`/api/class/attendance/${idPath(id)}?${query({ date })}`, { signal }).then(arrayResponse);
export const listNotices = (id, { signal } = {}) =>
    teacherRequest(`/api/class/notice/${idPath(id)}`, { signal }).then(arrayResponse);
export const getNotice = (id, noticeId, { signal } = {}) =>
    teacherRequest(`/api/class/notice/${idPath(id)}/${idPath(noticeId)}`, { signal });
// Swagger's nested Create/Update schema names collide with schedule DTOs.
// NoticeRequest.Create/Update in Refit_Server require title/content instead.
export const createNotice = (id, body) =>
    teacherRequest(`/api/class/notice/${idPath(id)}`, { method: 'POST', body });
export const updateNotice = (id, noticeId, body) =>
    teacherRequest(`/api/class/notice/${idPath(id)}/${idPath(noticeId)}`, { method: 'PATCH', body });
export const deleteNotice = (id, noticeId) =>
    teacherRequest(`/api/class/notice/${idPath(id)}/${idPath(noticeId)}`, { method: 'DELETE' });
export function uploadImage(file) {
    const body = new FormData();
    body.append('file', file);
    return teacherRequest('/api/files/images', { method: 'POST', body });
}
