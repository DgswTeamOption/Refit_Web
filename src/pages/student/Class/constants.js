// 수업 상세 페이지 관련 상수 및 API 매퍼

export const CLASS_TABS = [
    { key: 'main', label: '메인' },
    { key: 'absence', label: '결석 일정' },
    { key: 'makeup', label: '보강 일정' },
];

// 날짜 문자열에서 YYYY-MM-DD 추출
export const extractIsoDate = (value) => {
    if (!value) return '';
    const str = String(value).trim();
    const match = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
        const [, y, m, d] = match;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const parsed = new Date(str);
    if (!Number.isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return '';
};

// YYYY-MM-DD -> YYYY년 M월 D일 포맷팅 (년도 포함)
export const formatToKoreanDate = (dateStr) => {
    if (!dateStr) return '';
    const iso = extractIsoDate(dateStr);
    if (iso) {
        const [y, m, d] = iso.split('-');
        return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
    }
    return String(dateStr);
};

// ISO 문자열 -> YYYY. MM. DD
export const formatToDotDate = (isoStr) => {
    if (!isoStr) return '';
    const iso = extractIsoDate(isoStr);
    if (iso) {
        const [y, m, d] = iso.split('-');
        return `${y}. ${m}. ${d}`;
    }
    return String(isoStr);
};

// ISO 문자열 -> HH:mm
export const formatToTime = (isoStr) => {
    if (!isoStr) return '';
    const parsed = new Date(isoStr);
    if (Number.isNaN(parsed.getTime())) return '';
    const hh = String(parsed.getHours()).padStart(2, '0');
    const mm = String(parsed.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
};

export const mapNoticeFromApi = (item) => {
    const contentText = typeof item?.content === 'string' ? item.content : '';
    const paragraphs = Array.isArray(item?.content)
        ? item.content
        : contentText.split('\n').filter((line) => line.trim() !== '');

    return {
        id: item?.noticeId ?? item?.id,
        author: item?.writerName || '선생님',
        date: formatToDotDate(item?.createdAt || item?.updatedAt) || '-',
        title: item?.title || '',
        excerpt: paragraphs[0] || contentText || '',
        content: paragraphs.length > 0 ? paragraphs : ['내용이 없습니다.'],
    };
};

const ATTENDANCE_STATUS_MAP = {
    PRESENT: '출석',
    LATE: '지각',
    ABSENT: '결석',
    MAKEUP: '보강',
};

export const mapAttendanceFromApi = (item, classTitle) => {
    const rawDate = extractIsoDate(item?.attendance_date || item?.date || item?.checked_at);
    return {
        id: item?.id ?? `${rawDate}-${item?.status || 'attendance'}`,
        rawDate,
        date: formatToKoreanDate(rawDate),
        className: classTitle,
        status: ATTENDANCE_STATUS_MAP[item?.status] || item?.status || '출석',
    };
};

const APPROVAL_STATUS_MAP = {
    PENDING: '대기중',
    APPROVED: '수락됨',
    REJECTED: '거절됨',
    CANCELED: '취소됨',
    0: '대기중',
    1: '수락됨',
    2: '거절됨',
    3: '취소됨',
};

export const mapAbsenceFromApi = (item, fallback = {}) => {
    const statusLabel = APPROVAL_STATUS_MAP[item?.status] || item?.status || fallback.status || '대기중';
    const rawDate = extractIsoDate(item?.absence_date || item?.created_at || fallback.rawDate);
    return {
        id: item?.absenceId ?? item?.absence_id ?? item?.id ?? fallback.id ?? Date.now(),
        scheduleId: item?.scheduleId ?? item?.schedule_id ?? fallback.scheduleId ?? null,
        rawDate,
        date: formatToKoreanDate(rawDate) || fallback.date || '-',
        reason: item?.reason || fallback.reason || '기타 사유',
        rejectReason: item?.reject_reason || item?.rejectReason || '',
        status: statusLabel,
        canCancel: statusLabel === '대기중',
    };
};

export const mapMakeupFromApi = (item, fallback = {}) => {
    const rawStatus = item?.approval_status ?? item?.status;
    const statusLabel = APPROVAL_STATUS_MAP[rawStatus] || fallback.status || '대기중';
    const rawDate = extractIsoDate(item?.makeup_time || item?.created_at || fallback.isoMakeupTime);
    const timeStr = item?.makeup_time ? formatToTime(item.makeup_time) : '';

    return {
        id: item?.makeupId ?? item?.makeup_id ?? item?.id ?? fallback.id ?? Date.now(),
        rawDate,
        date: formatToKoreanDate(rawDate) || fallback.date || '-',
        time: timeStr || fallback.time || '시간 미정',
        reason: item?.reason || fallback.reason || '보강 신청',
        rejectReason: item?.reject_reason || item?.rejectReason || '',
        status: statusLabel,
        canCancel: statusLabel === '대기중',
    };
};

// 특정 연·월의 날짜(day)에 색상 점 추가 (중복 방지)
function addEventColor(eventsMap, isoDate, targetYear, targetMonth, color) {
    if (!isoDate || !color) return;
    const [y, m, d] = isoDate.split('-').map(Number);
    if (y !== targetYear || m !== targetMonth || !d) return;

    if (!eventsMap[d]) {
        eventsMap[d] = [];
    }
    if (!eventsMap[d].includes(color)) {
        eventsMap[d].push(color);
    }
}

// 출석/결석/보강 및 캘린더 API 데이터를 달력 점 색상 맵({ [day]: colors[] })으로 변환
export const buildAttendanceCalendarEvents = ({
    year,
    month,
    calendarData = [],
    attendanceList = [],
    absenceList = [],
    makeupList = [],
}) => {
    const eventsMap = {};

    // 1. 출석 기록 반영
    attendanceList.forEach((item) => {
        if (item.status === '출석' || item.status === '지각') {
            addEventColor(eventsMap, item.rawDate, year, month, 'blue');
        } else if (item.status === '결석') {
            addEventColor(eventsMap, item.rawDate, year, month, 'red');
        } else if (item.status === '보강') {
            addEventColor(eventsMap, item.rawDate, year, month, 'yellow');
        }
    });

    // 2. 수락된 결석 반영
    absenceList.forEach((item) => {
        if (item.status === '수락됨') {
            addEventColor(eventsMap, item.rawDate, year, month, 'red');
        }
    });

    // 3. 보강 신청 내역 반영 (수락됨 -> 노랑, 대기중 -> 진회색)
    makeupList.forEach((item) => {
        if (item.status === '수락됨') {
            addEventColor(eventsMap, item.rawDate, year, month, 'yellow');
        } else if (item.status === '대기중') {
            addEventColor(eventsMap, item.rawDate, year, month, 'darkGray');
        }
    });

    // 4. 수업 캘린더 API 응답에 출석/결석/보강 정보가 있는 경우 보조 반영
    const calendarItems = Array.isArray(calendarData)
        ? calendarData
        : Array.isArray(calendarData?.events)
            ? calendarData.events
            : Array.isArray(calendarData?.dates)
                ? calendarData.dates
                : [];

    calendarItems.forEach((entry) => {
        if (!entry || typeof entry !== 'object') return;
        const isoDate = extractIsoDate(
            entry.date || entry.class_date || entry.attendance_date || entry.makeup_time || entry.start_time
        );
        const status = String(entry.status || entry.type || entry.attendance_status || '').toUpperCase();

        if (status === 'PRESENT' || status === 'LATE' || status === '출석') {
            addEventColor(eventsMap, isoDate, year, month, 'blue');
        } else if (status === 'ABSENT' || status === '결석') {
            addEventColor(eventsMap, isoDate, year, month, 'red');
        } else if (status === 'MAKEUP' || status === 'APPROVED' || status === '보강') {
            addEventColor(eventsMap, isoDate, year, month, 'yellow');
        } else if (status === 'PENDING' || status === 'MAKEUP_PENDING' || status === '대기중') {
            addEventColor(eventsMap, isoDate, year, month, 'darkGray');
        }
    });

    return eventsMap;
};
