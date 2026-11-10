import React from 'react';

function CalendarBlock({ date, isWeekend, colors, onClick, isSelected }) {
    if (date !== undefined && date !== null && date !== '') {
        const isClickable = typeof date === 'number' && typeof onClick === 'function';
        return (
            <div
                className={`CalendarBlock ${isSelected ? 'is-selected' : ''} ${isClickable ? 'is-clickable' : ''}`}
                onClick={isClickable ? () => onClick(date) : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={isClickable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onClick(date);
                    }
                } : undefined}
            >
                <div className={`CalendarDate${isWeekend ? 'Weekend' : ''}`}>{date}</div>
                <div className="CalendarCircleWrap">
                    {Array.isArray(colors)
                        ? colors.map((color, idx) => {
                            const formattedColor = color[0].toUpperCase() + color.slice(1);
                            return (
                                <div
                                    key={`${color}-${idx}`}
                                    className={`CalendarCircle CalendarCircle${formattedColor}`}
                                />
                            );
                        })
                        : null}
                </div>
            </div>
        );
    }

    return <div className="CalendarBlock" />;
}

export default CalendarBlock;
