import apiClient from './apiClient';

/**
 * Student 하위 페이지 전용 Swagger API 모듈
 * Base URL: https://refit.team
 */
export const studentApi = {
    // 1. 수업 목록 / 참여 / 나가기 (Overview)
    getMyClasses: (signal) => apiClient.get('/api/class', { signal }),

    joinClass: (classCode) => apiClient.post('/api/class/join', { classCode }),

    leaveClass: (classroomId) => apiClient.delete(`/api/class/${classroomId}/leave`),

    // 2. 수업 상세 및 캘린더 (Class)
    getClassDetail: (classroomId, { year, month } = {}, signal) =>
        apiClient.get(`/api/class/${classroomId}`, { params: { year, month }, signal }),

    getClassCalendar: (classId, { year, month }, signal) =>
        apiClient.get(`/api/class/calendar/${classId}`, { params: { year, month }, signal }),

    getClassSchedules: (classId, signal) =>
        apiClient.get(`/api/class/schedule/${classId}`, { signal }),

    // 3. 공지사항 (ClassMain, NoticeList, NoticeDetail)
    getNotices: (classId, signal) =>
        apiClient.get(`/api/class/notice/${classId}`, { signal }),

    getNoticeDetail: (classId, noticeId, signal) =>
        apiClient.get(`/api/class/notice/${classId}/${noticeId}`, { signal }),

    // 4. 출석 현황 및 통계 (ClassMain)
    getMyAttendance: (classId, { year, month }, signal) =>
        apiClient.get(`/api/class/attendance/${classId}/me`, { params: { year, month }, signal }),

    getAttendanceStats: (classId, { year, month }, signal) =>
        apiClient.get(`/api/class/attendance/stats/${classId}`, { params: { year, month }, signal }),

    // 5. 결석 신청 및 내역 (AbsenceList, AbsenceApply)
    getMyAbsences: (classId, signal) =>
        apiClient.get(`/api/class/absences/${classId}/me`, { signal }),

    requestAbsence: (classId, { reason, absence_date }) =>
        apiClient.post(`/api/class/absences/${classId}`, { reason, absence_date }),

    cancelAbsence: (absenceId) =>
        apiClient.delete(`/api/class/absences/${absenceId}`),

    // 6. 보강 신청 및 내역 (MakeupList, MakeupApply)
    getMakeups: (classId, approval_status, signal) =>
        apiClient.get(`/api/class/makeups/${classId}`, {
            params: { approval_status },
            signal,
        }),

    getMakeupAvailability: ({ class_id, teacher_id, schedule_id }, signal) =>
        apiClient.get('/api/makeups/availability', {
            params: { class_id, teacher_id, schedule_id },
            signal,
        }),

    requestMakeup: ({ class_id, schedule_id, makeup_time }) =>
        apiClient.post('/api/makeups/request', {
            class_id,
            schedule_id,
            makeup_time,
        }),

    cancelMakeup: (makeupId) =>
        apiClient.patch(`/api/makeups/cancel/${makeupId}`),
};

export default studentApi;
