const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const TOKEN_KEY = 'accessToken';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function request(endpoint, options = {}) {
  const token = getAccessToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `API 오류 (${response.status})`);
  }

  if (data && data.success === false) {
    throw new Error(data.error?.message || '요청 처리에 실패했습니다.');
  }

  return data?.data !== undefined ? data.data : data;
}

export const getTeacherClasses = () => request('/api/class');
export const createTeacherClass = (data) =>
  request('/api/class', { method: 'POST', body: JSON.stringify(data) });
export const deleteTeacherClass = (classroomId) =>
  request(`/api/class/${classroomId}`, { method: 'DELETE' });

export const getClassStudents = (classroomId) =>
  request(`/api/class/${classroomId}/students`);

export const getClassMakeups = (classId, approvalStatus) =>
  request(`/api/class/makeups/${classId}${buildQuery({ approval_status: approvalStatus })}`);
export const approveMakeup = (makeupId, approvalStatus = 1) =>
  request(`/api/makeups/approve/${makeupId}`, {
    method: 'PATCH',
    body: JSON.stringify({ approval_status: approvalStatus }),
  });
export const cancelMakeup = (makeupId) =>
  request(`/api/makeups/cancel/${makeupId}`, { method: 'PATCH' });

export const getMakeupAvailabilities = (params) =>
  request(`/api/makeups/availability${buildQuery(params)}`);
export const createMakeupAvailability = (data) =>
  request('/api/makeups/availability', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateMakeupAvailability = (availabilityId, data) =>
  request(`/api/makeups/availability/${availabilityId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteMakeupAvailability = (availabilityId) =>
  request(`/api/makeups/availability/${availabilityId}`, {
    method: 'DELETE',
  });

export const getClassSchedules = (classId) =>
  request(`/api/class/schedule/${classId}`);
export const createClassSchedule = (classId, data) =>
  request(`/api/class/schedule/${classId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateClassSchedule = (classId, scheduleId, data) =>
  request(`/api/class/schedule/${classId}/${scheduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteClassSchedule = (classId, scheduleId) =>
  request(`/api/class/schedule/${classId}/${scheduleId}`, {
    method: 'DELETE',
  });

export const getClassAttendance = (classId, date) =>
  request(`/api/class/attendance/${classId}${buildQuery({ date })}`);
export const updateClassAttendance = (classId, scheduleId, status) =>
  request(`/api/class/attendance/${classId}/${scheduleId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
export const getUncheckedAttendance = (classId, date) =>
  request(`/api/class/attendance/${classId}/unchecked${buildQuery({ date })}`);
export const getAttendanceStats = (classId, year, month) =>
  request(`/api/class/attendance/stats/${classId}${buildQuery({ year, month })}`);

export const getClassAbsences = (classId, params) =>
  request(`/api/class/absences/${classId}${buildQuery(params)}`);
export const approveAbsence = (absenceId) =>
  request(`/api/class/absences/${absenceId}/approve`, { method: 'PATCH' });
export const rejectAbsence = (absenceId) =>
  request(`/api/class/absences/${absenceId}/reject`, { method: 'PATCH' });