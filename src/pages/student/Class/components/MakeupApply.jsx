import React, { useState } from 'react';
import Calendar from '../../../../components/Calendar/Calendar';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';
import { formatToKoreanDate } from '../constants';

/**
 * 보강 신청 폼 및 신청 내역 화면 (view13)
 * - 날짜 선택 필수 검증
 * - 시작 시간 < 종료 시간 유효성 검증
 */
function MakeupApply({ items = [], onSubmit, onCancel }) {
    const [makeupDate, setMakeupDate] = useState('');
    const [makeupDay, setMakeupDay] = useState(null);
    const [makeupStartTime, setMakeupStartTime] = useState('');
    const [makeupEndTime, setMakeupEndTime] = useState('');
    const [makeupReason, setMakeupReason] = useState('');

    const isTimeInvalid = Boolean(
        makeupStartTime && makeupEndTime && makeupStartTime >= makeupEndTime
    );

    const handleSelectDateFromCalendar = (day) => {
        setMakeupDay(day);
        const dayStr = String(day).padStart(2, '0');
        setMakeupDate(`2026-08-${dayStr}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!makeupDate || !makeupDate.trim() || isTimeInvalid) return;

        const timeStr = makeupStartTime && makeupEndTime
            ? `${makeupStartTime} ~ ${makeupEndTime}`
            : (makeupStartTime || makeupEndTime || '16:00 ~ 17:00');

        onSubmit({
            id: Date.now(),
            date: formatToKoreanDate(makeupDate),
            time: timeStr,
            reason: makeupReason.trim() || '기타 사유',
            status: '대기중',
            canCancel: true,
        });

        setMakeupDate('');
        setMakeupDay(null);
        setMakeupStartTime('');
        setMakeupEndTime('');
        setMakeupReason('');
    };

    return (
        <div className="apply-view-wrapper">
            <h2 className="apply-section-guide-title">신청할 날짜를 선택해주세요</h2>
            <div className="apply-two-columns">
                {/* 좌측 캘린더 (날짜 클릭 지원) */}
                <div className="apply-calendar-column">
                    <Calendar
                        mode="attendance"
                        onSelectDate={handleSelectDateFromCalendar}
                        selectedDate={makeupDay}
                    />
                </div>

                {/* 우측 신청 정보 폼 */}
                <div className="apply-form-column">
                    <h3 className="apply-form-title">신청 정보</h3>
                    <form onSubmit={handleSubmit} className="apply-form-body">
                        <label className="apply-field-label" htmlFor="makeup-date">
                            신청 날짜 <span style={{ color: '#F04444' }}>*</span>
                        </label>
                        <input
                            id="makeup-date"
                            type="date"
                            required
                            className="apply-input"
                            value={makeupDate}
                            onChange={(e) => {
                                setMakeupDate(e.target.value);
                                if (e.target.value.includes('-')) {
                                    const day = parseInt(e.target.value.split('-')[2], 10);
                                    setMakeupDay(day);
                                }
                            }}
                        />

                        <label className="apply-field-label" htmlFor="makeup-start-time">
                            보강 시간 <span style={{ color: '#F04444' }}>*</span>
                        </label>
                        <div className="apply-time-row">
                            <input
                                id="makeup-start-time"
                                type="time"
                                required
                                className={`apply-input apply-time-input ${isTimeInvalid ? 'input-error' : ''}`}
                                value={makeupStartTime}
                                onChange={(e) => setMakeupStartTime(e.target.value)}
                            />
                            <span className="apply-time-tilde">~</span>
                            <input
                                id="makeup-end-time"
                                type="time"
                                required
                                className={`apply-input apply-time-input ${isTimeInvalid ? 'input-error' : ''}`}
                                value={makeupEndTime}
                                onChange={(e) => setMakeupEndTime(e.target.value)}
                            />
                        </div>
                        {isTimeInvalid && (
                            <p className="apply-time-error-text" style={{ color: '#F04444', fontSize: '13px', margin: '6px 0 0 0' }}>
                                시작 시간은 종료 시간보다 앞서야 합니다.
                            </p>
                        )}

                        <label className="apply-field-label" htmlFor="makeup-reason">
                            신청 사유
                        </label>
                        <textarea
                            id="makeup-reason"
                            className="apply-textarea"
                            placeholder="사유를 입력해주세요"
                            value={makeupReason}
                            onChange={(e) => setMakeupReason(e.target.value)}
                        />

                        <div className="apply-submit-btn-wrap">
                            <Button
                                text="신청하기"
                                color="blue"
                                width={140}
                                type="submit"
                                disabled={isTimeInvalid}
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* 하단 신청 내역 */}
            <div className="apply-bottom-history">
                <h3 className="apply-history-title">신청 내역</h3>
                <div className="content-card history-table-card">
                    <HistoryTable
                        items={items}
                        contentLabel="사유"
                        showTime={true}
                        onCancel={onCancel}
                    />
                </div>
            </div>
        </div>
    );
}

export default MakeupApply;
