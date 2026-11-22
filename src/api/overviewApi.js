import { apiRequest, refreshAuthToken } from './apiClient.js';

export const getAccessToken = () => null;
export const setAccessToken = () => {};

let refreshPromise = null;

function isValidParam(value) {
  if (value === undefined || value === null) return false;
  const str = String(value).trim();
  return str !== '' && str !== 'undefined' && str !== 'null';
}

function requireValidId(id, label = 'ID') {
  if (!isValidParam(id)) {
    throw new Error(`유효하지 않은 ${label}입니다.`);
  }
  return encodeURIComponent(String(id).trim());
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (isValidParam(value)) {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshAuthToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request(endpoint, options = {}, isRetry = false) {
  const body = typeof options.body === 'string'
    ? parseJsonSafely(options.body)
    : options.body;
  return apiRequest(endpoint, {
    method: options.method || 'GET',
    body,
    signal: options.signal,
    skipAuthRefresh: isRetry,
  });
}

export const refreshAuth = () => refreshSession();
export const logoutAuth = () =>
  request('/api/auth/logout', { method: 'POST' });

export const getTeacherClasses = () => request('/api/class');
export const createTeacherClass = (data) =>
  request('/api/class', { method: 'POST', body: JSON.stringify(data) });
export const deleteTeacherClass = (classroomId) =>
  request(`/api/class/${requireValidId(classroomId, '수업 ID')}`, {
    method: 'DELETE',
  });

export const getClassStudents = (classroomId) =>
  request(`/api/class/${requireValidId(classroomId, '수업 ID')}/students`);

export const getClassMakeups = (classId, approvalStatus) =>
  request(
    `/api/class/makeups/${requireValidId(classId, '수업 ID')}${buildQuery({
      approval_status: approvalStatus,
    })}`
  );
export const approveMakeup = (makeupId, approvalStatus = 1) =>
  request(`/api/makeups/approve/${requireValidId(makeupId, '보강 ID')}`, {
    method: 'PATCH',
    body: JSON.stringify({ approval_status: approvalStatus }),
  });
export const rejectMakeup = (makeupId) => approveMakeup(makeupId, 2);
export const cancelMakeup = (makeupId) =>
  request(`/api/makeups/cancel/${requireValidId(makeupId, '보강 ID')}`, {
    method: 'PATCH',
  });

export const getMakeupAvailabilities = (params) =>
  request(`/api/makeups/availability${buildQuery(params)}`);
export const createMakeupAvailability = (data) =>
  request('/api/makeups/availability', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateMakeupAvailability = (availabilityId, data) =>
  request(
    `/api/makeups/availability/${requireValidId(availabilityId, '보강 가능 시간 ID')}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
export const deleteMakeupAvailability = (availabilityId) =>
  request(
    `/api/makeups/availability/${requireValidId(availabilityId, '보강 가능 시간 ID')}`,
    {
      method: 'DELETE',
    }
  );

export const getClassSchedules = (classId) =>
  request(`/api/class/schedule/${requireValidId(classId, '수업 ID')}`);
export const createClassSchedule = (classId, data) =>
  request(`/api/class/schedule/${requireValidId(classId, '수업 ID')}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateClassSchedule = (classId, scheduleId, data) =>
  request(
    `/api/class/schedule/${requireValidId(classId, '수업 ID')}/${requireValidId(
      scheduleId,
      '일정 ID'
    )}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
export const deleteClassSchedule = (classId, scheduleId) =>
  request(
    `/api/class/schedule/${requireValidId(classId, '수업 ID')}/${requireValidId(
      scheduleId,
      '일정 ID'
    )}`,
    {
      method: 'DELETE',
    }
  );

export const getClassScheduleRules = (classId) =>
  request(`/api/class/schedule-rules/${requireValidId(classId, '수업 ID')}`);
export const createClassScheduleRule = (classId, data) =>
  request(`/api/class/schedule-rules/${requireValidId(classId, '수업 ID')}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateClassScheduleRule = (classId, ruleId, data) =>
  request(
    `/api/class/schedule-rules/${requireValidId(classId, '수업 ID')}/${requireValidId(
      ruleId,
      '시간표 규칙 ID'
    )}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
export const deleteClassScheduleRule = (classId, ruleId) =>
  request(
    `/api/class/schedule-rules/${requireValidId(classId, '수업 ID')}/${requireValidId(
      ruleId,
      '시간표 규칙 ID'
    )}`,
    {
      method: 'DELETE',
    }
  );

export const getClassAttendance = (classId, date) =>
  request(
    `/api/class/attendance/${requireValidId(classId, '수업 ID')}${buildQuery({
      date,
    })}`
  );
export const updateClassAttendance = (classId, scheduleId, status) =>
  request(
    `/api/class/attendance/${requireValidId(classId, '수업 ID')}/${requireValidId(
      scheduleId,
      '일정 ID'
    )}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  );
export const getUncheckedAttendance = (classId, date) =>
  request(
    `/api/class/attendance/${requireValidId(
      classId,
      '수업 ID'
    )}/unchecked${buildQuery({ date })}`
  );
export const getAttendanceStats = (classId, year, month) =>
  request(
    `/api/class/attendance/stats/${requireValidId(
      classId,
      '수업 ID'
    )}${buildQuery({ year, month })}`
  );

export const getClassAbsences = (classId, params) =>
  request(
    `/api/class/absences/${requireValidId(classId, '수업 ID')}${buildQuery(
      params
    )}`
  );
export const approveAbsence = (absenceId) =>
  request(`/api/class/absences/${requireValidId(absenceId, '결석 ID')}/approve`, {
    method: 'PATCH',
  });
export const rejectAbsence = (absenceId) =>
  request(`/api/class/absences/${requireValidId(absenceId, '결석 ID')}/reject`, {
    method: 'PATCH',
  });

export default {
  getAccessToken,
  setAccessToken,
  refreshAuth,
  logoutAuth,
  getTeacherClasses,
  createTeacherClass,
  deleteTeacherClass,
  getClassStudents,
  getClassMakeups,
  approveMakeup,
  rejectMakeup,
  cancelMakeup,
  getMakeupAvailabilities,
  createMakeupAvailability,
  updateMakeupAvailability,
  deleteMakeupAvailability,
  getClassSchedules,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
  getClassScheduleRules,
  createClassScheduleRule,
  updateClassScheduleRule,
  deleteClassScheduleRule,
  getClassAttendance,
  updateClassAttendance,
  getUncheckedAttendance,
  getAttendanceStats,
  getClassAbsences,
  approveAbsence,
  rejectAbsence,
};
