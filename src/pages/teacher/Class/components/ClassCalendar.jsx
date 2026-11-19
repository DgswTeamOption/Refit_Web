import Calendar from '../../../../components/Calendar/Calendar.jsx';
import { calendarEvents, classColor } from '../../teacherViewData.js';

export default function ClassCalendar({ period, onPeriodChange, classroom, selectedDate, onSelectDate, weeklySchedules }) {
    const classes = [{ id: classroom.classroomId, name: classroom.name }];
    const prefix = period.year + '-' + String(period.month).padStart(2, '0') + '-';
    return (
        <Calendar
            period={period}
            onPeriodChange={onPeriodChange}
            events={calendarEvents(classroom.calendar || [], classes, period, weeklySchedules)}
            classes={classes.map((item) => ({ id: item.id, title: item.name, color: classColor(item.id) }))}
            selectedDate={selectedDate.startsWith(prefix) ? Number(selectedDate.slice(8, 10)) : null}
            onSelectDate={(day) => onSelectDate(prefix + String(day).padStart(2, '0'))}
        />
    );
}
