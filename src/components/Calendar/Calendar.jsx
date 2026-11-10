import React, { useState } from 'react';
import CalendarBefore from '../../assets/CalendarBefore.svg';
import CalendarAfter from '../../assets/CalendarAfter.svg';
import { CalendarContainer } from './Calendar.styles';
import CalendarBlock from './CalendarBlock';
import './Calendar.css';

function Calendar({ mode = 'class', onSelectDate, selectedDate }) {
    // 2026년 8월 기준 (Figma 시안 기준)
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(7); // 0-indexed (7 = 8월)

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

    // 시안(view1 vs view5/view10)에 따른 날짜별 도트 매핑
    const classEvents = {
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
                        onClick={onSelectDate}
                        isSelected={selectedDate === date}
                    />
                ))}
            </div>

            {/* 하단 범례 (모드에 따라 변경) */}
            <div className="CalendarFoot">
                {mode === 'class' ? (
                    <>
                        <div className="CalendarFootTag">
                            <div className="CalendarCircle CalendarCirclePeach" />
                            <div>영어1</div>
                        </div>
                        <div className="CalendarFootTag">
                            <div className="CalendarCircle CalendarCircleLavender" />
                            <div>영어2</div>
                        </div>
                        <div className="CalendarFootTag">
                            <div className="CalendarCircle CalendarCircleYellow" />
                            <div>수학1</div>
                        </div>
                        <div className="CalendarFootTag">
                            <div className="CalendarCircle CalendarCircleMint" />
                            <div>수학2</div>
                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </CalendarContainer>
    );
}

export default Calendar;
