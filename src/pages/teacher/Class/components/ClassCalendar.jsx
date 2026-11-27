import Calendar from '../../../../components/Calendar/Calendar.jsx';
import { teacherClassCalendarEvents } from '../../teacherViewData.js';

export default function ClassCalendar({ period, onPeriodChange, classroom, makeups, selectedDate, onSelectDate }) {
    return (
        <Calendar
            mode="teacher"
            highlightToday
            period={period}
            onPeriodChange={onPeriodChange}
            events={teacherClassCalendarEvents(classroom.calendar || [], makeups, period)}
            selectedDate={selectedDate}
            onSelectDate={(day, year, month) =>
                onSelectDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
            }
        />
    );
}
