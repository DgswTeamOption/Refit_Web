import React, { useState } from 'react';
import CalendarBefore from '../../assets/CalendarBefore.svg';
import CalendarAfter from '../../assets/CalendarAfter.svg';
import { CalendarContainer } from './Calendar.styles';
import CalendarBlock from './CalendarBlock';
import './Calendar.css';

const DEFAULT_CLASS_EVENTS = {
    4: ['lavender', 'mint'],
    6: ['lavender', 'mint'],
    11: ['peach', 'lavender', 'yellow'],
    13: ['lavender', 'mint', 'yellow'],
    18: ['lavender', 'mint'],
    20: ['lavender', 'mint'],
    25: ['peach', 'lavender', 'yellow'],
    27: ['peach', 'lavender', 'yellow'],
};

const DEFAULT_ATTENDANCE_EVENTS = {
    4: ['darkGray', 'blue'],
    6: ['darkGray', 'blue'],
    11: ['red', 'blue', 'yellow'],
    13: ['red', 'blue', 'yellow'],
    18: ['darkGray', 'blue'],
    20: ['darkGray', 'blue'],
    25: ['red', 'blue', 'yellow'],
    27: ['red', 'blue', 'yellow'],
};

function Calendar({
    mode = 'class',
    classes = null,
    events = null,
    year: controlledYear,
    month: controlledMonth, // 1-indexed (1 ~ 12)
    onMonthChange,
    period,
    onPeriodChange,
    onSelectDate,
    selectedDate,
    highlightToday = false,
}) {
    const [internalYear, setInternalYear] = useState(() => new Date().getFullYear());
    const [internalMonth, setInternalMonth] = useState(() => new Date().getMonth()); // 0-indexed
    const [today] = useState(() => new Date());

    const isControlledByPeriod = Boolean(period && typeof period.year === 'number' && typeof period.month === 'number');
    const isControlledByProps = typeof controlledYear === 'number' && typeof controlledMonth === 'number';

    const year = isControlledByPeriod
        ? period.year
        : isControlledByProps
            ? controlledYear
            : internalYear;
    const month = isControlledByPeriod
        ? period.month - 1
        : isControlledByProps
            ? controlledMonth - 1
            : internalMonth; // 0-indexed

    const todayDate = highlightToday && year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : null;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const updateMonth = (nextYear, nextMonthZeroBased) => {
        const nextMonthOneBased = nextMonthZeroBased + 1;

        if (!isControlledByPeriod && !isControlledByProps) {
            setInternalYear(nextYear);
            setInternalMonth(nextMonthZeroBased);
        }
        if (onPeriodChange) {
            onPeriodChange({ year: nextYear, month: nextMonthOneBased });
        }
        if (onMonthChange) {
            onMonthChange(nextYear, nextMonthOneBased);
        }
    };

    const handlePrevMonth = () => {
        const previous = new Date(year, month - 1, 1);
        updateMonth(previous.getFullYear(), previous.getMonth());
    };

    const handleNextMonth = () => {
        const next = new Date(year, month + 1, 1);
        updateMonth(next.getFullYear(), next.getMonth());
    };

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const isClassEmpty = Array.isArray(classes) && classes.length === 0;

    // events prop이 전달되면 실제 데이터만 사용 (미전달 시 기존 공용 호환 유지)
    const activeEvents = events !== null && events !== undefined
        ? events
        : mode === 'attendance'
            ? DEFAULT_ATTENDANCE_EVENTS
            : mode === 'teacher'
                ? {}
            : (isClassEmpty ? {} : DEFAULT_CLASS_EVENTS);

    const checkSelected = (date) => {
        if (typeof selectedDate === 'string' && selectedDate.includes('-')) {
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(date).padStart(2, '0');
            return selectedDate === `${year}-${monthStr}-${dayStr}`;
        }
        return selectedDate === date;
    };

    return (
        <CalendarContainer>
            <div className="CalendarHead">
                <div className="CalendarMonth">{year}년 {month + 1}월</div>
                <div className="CalendarButtonWrap">
                    <button type="button" onClick={handlePrevMonth} aria-label="이전 달">
                        <img src={CalendarBefore} alt="" />
                    </button>
                    <button type="button" onClick={handleNextMonth} aria-label="다음 달">
                        <img src={CalendarAfter} alt="" />
                    </button>
                </div>
            </div>

            <div className="CalendarBody">
                {/* 요일 헤더 */}
                {weekDays.map((day, idx) => (
                    <CalendarBlock key={day} date={day} isWeekend={idx === 0 || idx === 6} />
                ))}

                {/* 1일 이전 빈 칸 */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <CalendarBlock key={`empty-${idx}`} />
                ))}

                {/* 일자 렌더링 */}
                {Array.from({ length: lastDate }, (_, i) => i + 1).map((date) => (
                    <CalendarBlock
                        key={date}
                        date={date}
                        colors={activeEvents[date] || []}
                        onClick={onSelectDate ? (day) => onSelectDate(day, year, month + 1) : undefined}
                        isSelected={checkSelected(date)}
                        isToday={todayDate === date}
                    />
                ))}
            </div>

            {/* 하단 범례 (모드에 따라 변경) */}
            {mode === 'teacher' ? (
                <div className="CalendarFoot">
                    <div className="CalendarFootTag">
                        <div className="CalendarCircle CalendarCircleBlue" />
                        <div>수업</div>
                    </div>
                    <div className="CalendarFootTag">
                        <div className="CalendarCircle CalendarCircleYellow" />
                        <div>보강</div>
                    </div>
                    <div className="CalendarFootTag">
                        <div className="CalendarCircle CalendarCircleDarkGray" />
                        <div>보강 대기중</div>
                    </div>
                </div>
            ) : mode === 'class' ? (
                !isClassEmpty && (
                    <div className="CalendarFoot">
                        {(Array.isArray(classes) ? classes : [
                            { id: 'eng1', title: '영어1', color: 'peach' },
                            { id: 'eng2', title: '영어2', color: 'lavender' },
                            { id: 'math1', title: '수학1', color: 'yellow' },
                            { id: 'math2', title: '수학2', color: 'mint' },
                        ]).map((cls) => {
                            const color = cls.color || 'blue';
                            const formattedColor = color[0].toUpperCase() + color.slice(1);
                            return (
                                <div key={cls.id} className="CalendarFootTag">
                                    <div className={`CalendarCircle CalendarCircle${formattedColor}`} />
                                    <div>{cls.title}</div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                <div className="CalendarFoot">
                    <div className="CalendarFootTag">
                        <div className="CalendarCircle CalendarCircleBlue" />
                        <div>출석</div>
                    </div>
                    <div className="CalendarFootTag">
                        <div className="CalendarCircle CalendarCircleRed" />
                        <div>결석</div>
                    </div>
                    <div className="CalendarFootTag">
                        <div className="CalendarCircle CalendarCircleYellow" />
                        <div>보강</div>
                    </div>
                    <div className="CalendarFootTag">
                        <div className="CalendarCircle CalendarCircleDarkGray" />
                        <div>보강 대기중</div>
                    </div>
                </div>
            )}
        </CalendarContainer>
    );
}

export default Calendar;
