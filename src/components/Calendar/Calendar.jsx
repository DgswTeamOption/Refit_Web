import React, { useState } from 'react';
import CalendarBefore from '../../assets/CalendarBefore.svg';
import CalendarAfter from '../../assets/CalendarAfter.svg';
import { CalendarContainer } from './Calendar.styles';
import CalendarBlock from './CalendarBlock';
import './Calendar.css';

function Calendar({ mode = 'class', classes = null, onSelectDate, selectedDate }) {
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [month, setMonth] = useState(() => new Date().getMonth()); // 0-indexed

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const handlePrevMonth = () => {
        if (month === 0) {
            setYear((prev) => prev - 1);
            setMonth(11);
        } else {
            setMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 11) {
            setYear((prev) => prev + 1);
            setMonth(0);
        } else {
            setMonth((prev) => prev + 1);
        }
    };

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const isClassEmpty = Array.isArray(classes) && classes.length === 0;

    const classEvents = isClassEmpty ? {} : {
        4: ['lavender', 'mint'],
        6: ['lavender', 'mint'],
        11: ['peach', 'lavender', 'yellow'],
        13: ['lavender', 'mint', 'yellow'],
        18: ['lavender', 'mint'],
        20: ['lavender', 'mint'],
        25: ['peach', 'lavender', 'yellow'],
        27: ['peach', 'lavender', 'yellow'],
    };

    const attendanceEvents = {
        4: ['darkGray', 'blue'],
        6: ['darkGray', 'blue'],
        11: ['red', 'blue', 'yellow'],
        13: ['red', 'blue', 'yellow'],
        18: ['darkGray', 'blue'],
        20: ['darkGray', 'blue'],
        25: ['red', 'blue', 'yellow'],
        27: ['red', 'blue', 'yellow'],
    };

    const activeEvents = mode === 'attendance' ? attendanceEvents : classEvents;

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
                    />
                ))}
            </div>

            {/* 하단 범례 (모드에 따라 변경) */}
            {mode === 'class' ? (
                !isClassEmpty && (
                    <div className="CalendarFoot">
                        {(Array.isArray(classes) ? classes : [
                            { id: 'eng1', title: '영어1', color: 'peach' },
                            { id: 'eng2', title: '영어2', color: 'lavender' },
                            { id: 'math1', title: '수학1', color: 'yellow' },
                            { id: 'math2', title: '수학2', color: 'mint' },
                        ]).map((cls) => {
                            const formattedColor = cls.color[0].toUpperCase() + cls.color.slice(1);
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
