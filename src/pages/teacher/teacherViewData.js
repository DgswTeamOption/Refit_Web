export const CLASS_COLORS = ['peach', 'lavender', 'yellow', 'mint'];
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function classColor(id) {
    return CLASS_COLORS[Number(id) % CLASS_COLORS.length];
}

export function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function currentPeriod() {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

export function shiftPeriod({ year, month }, offset) {
    const date = new Date(year, month - 1 + offset, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function markCalendarDate(events, dateTime, { year, month }, color) {
    if (!color || typeof dateTime !== 'string') return;
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    if (!dateTime.startsWith(prefix)) return;
    const day = Number(dateTime.slice(8, 10));
    if (!Number.isInteger(day) || day < 1 || day > new Date(year, month, 0).getDate()) return;
    const marks = events[day] ??= [];
    if (!marks.includes(color)) marks.push(color);
}

export function teacherClassCalendarEvents(schedules, makeups, period) {
    const events = {};
    for (const schedule of schedules) {
        markCalendarDate(events, schedule.startTime ?? schedule.start_time ?? schedule.date, period, 'blue');
    }
    for (const makeup of makeups) {
        const status = String(makeup.approval_status ?? makeup.approvalStatus ?? '').toUpperCase();
        const color = ['0', 'PENDING', 'WAITING'].includes(status) ? 'darkGray'
            : ['1', 'APPROVED'].includes(status) ? 'yellow' : '';
        markCalendarDate(events, makeup.makeup_time ?? makeup.makeupTime, period, color);
    }
    return events;
}

// Weekly rows are keyed by class ID, for example { 4: [{ mon: '16:00' }] }.
export function calendarEvents(schedules, classes, { year, month }, weeklySchedules = {}) {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const colors = new Map(classes.map((item) => [String(item.id), classColor(item.id)]));
    const events = {};
    const mark = (day, color) => {
        const marks = events[day] ??= [];
        if (!marks.includes(color)) marks.push(color);
    };

    for (const schedule of schedules) {
        const start = schedule.startTime;
        if (typeof start !== 'string' || !start.startsWith(prefix)) continue;
        const day = Number(start.slice(8, 10));
        const color = colors.get(String(schedule.classId));
        if (color) mark(day, color);
    }

    const lastDay = new Date(year, month, 0).getDate();
    for (const [classId, rows] of Object.entries(weeklySchedules)) {
        const color = colors.get(classId);
        if (!color) continue;

        const weekdays = new Set(WEEKDAY_KEYS.filter((key) =>
            rows.some((row) => /^\d{2}:\d{2}$/.test(row[key]))
        ));
        if (!weekdays.size) continue;

        for (let day = 1; day <= lastDay; day++) {
            const weekday = WEEKDAY_KEYS[new Date(year, month - 1, day).getDay()];
            if (weekdays.has(weekday)) mark(day, color);
        }
    }

    return events;
}

export function attendanceTotals(rows) {
    return rows.reduce((total, row) => ({
        present: total.present + (row.present_count || 0),
        late: total.late + (row.late_count || 0),
        absent: total.absent + (row.absent_count || 0),
    }), { present: 0, late: 0, absent: 0 });
}

export function noticeForView(notice, teacherName) {
    const created = new Date(notice.createdAt);
    return {
        id: notice.noticeId,
        author: teacherName || '선생님',
        date: Number.isNaN(created.getTime()) ? '' : created.toLocaleDateString('ko-KR'),
        title: notice.title || '',
        content: notice.content || '',
    };
}

export function attendanceLabel(status) {
    return { PRESENT: '출석', ABSENT: '결석', LATE: '지각', UNCHECKED: '미출석' }[status] || '미처리';
}
