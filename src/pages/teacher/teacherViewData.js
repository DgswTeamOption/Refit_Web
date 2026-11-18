export const CLASS_COLORS = ['peach', 'lavender', 'yellow', 'mint'];

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

export function calendarEvents(schedules, classes, { year, month }) {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const colors = new Map(classes.map((item) => [String(item.id), classColor(item.id)]));
    return schedules.reduce((events, schedule) => {
        const start = schedule.startTime;
        if (typeof start !== 'string' || !start.startsWith(prefix)) return events;
        const day = Number(start.slice(8, 10));
        const color = colors.get(String(schedule.classId));
        if (color) events[day] = [...new Set([...(events[day] || []), color])];
        return events;
    }, {});
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
