import Calendar from '../../../../components/Calendar/Calendar.jsx';
import { calendarEvents, classColor } from '../../teacherViewData.js';

export default function OverviewCalendar({ period, onPeriodChange, schedules, classes }) {
    return (
        <Calendar
            period={period}
            onPeriodChange={onPeriodChange}
            events={calendarEvents(schedules, classes, period)}
            classes={classes.map((item) => ({ id: item.id, title: item.name, color: classColor(item.id) }))}
        />
    );
}
