import React, { useState } from 'react';
import Calendar from '../../../../components/Calendar/Calendar';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';
import { formatToKoreanDate } from '../constants';

/**
 * 결석 신청 폼 및 신청 내역 화면 (view12)
 */
function AbsenceApply({ items = [], onSubmit, onCancel }) {
    const [absenceDate, setAbsenceDate] = useState('');
    const [absenceDay, setAbsenceDay] = useState(null);
    const [absenceReason, setAbsenceReason] = useState('');

    const handleSelectDateFromCalendar = (day) => {
        setAbsenceDay(day);
        const dayStr = String(day).padStart(2, '0');
        setAbsenceDate(`2026-08-${dayStr}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!absenceDate || !absenceDate.trim()) return;

        onSubmit({
            id: Date.now(),
            date: formatToKoreanDate(absenceDate),
            reason: absenceReason.trim() || '기타 사유',
            status: '대기중',
            canCancel: true,
        });

        setAbsenceDate('');
        setAbsenceDay(null);
        setAbsenceReason('');
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
                        selectedDate={absenceDay}
                    />
                </div>

                {/* 우측 신청 정보 폼 */}
                <div className="apply-form-column">
                    <h3 className="apply-form-title">신청 정보</h3>
                    <form onSubmit={handleSubmit} className="apply-form-body">
                        <label className="apply-field-label" htmlFor="absence-date">
                            신청 날짜 <span style={{ color: '#F04444' }}>*</span>
                        </label>
                        <input
                            id="absence-date"
                            type="date"
                            required
                            className="apply-input"
                            value={absenceDate}
                            onChange={(e) => {
                                setAbsenceDate(e.target.value);
                                if (e.target.value.includes('-')) {
                                    const day = parseInt(e.target.value.split('-')[2], 10);
                                    setAbsenceDay(day);
                                }
                            }}
                        />

                        <label className="apply-field-label" htmlFor="absence-reason">
                            신청 사유
                        </label>
                        <textarea
                            id="absence-reason"
                            className="apply-textarea"
                            placeholder="사유를 입력해주세요"
                            value={absenceReason}
                            onChange={(e) => setAbsenceReason(e.target.value)}
                        />

                        <div className="apply-submit-btn-wrap">
                            <Button text="신청하기" color="blue" width={140} type="submit" />
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
                        onCancel={onCancel}
                    />
                </div>
            </div>
        </div>
    );
}

export default AbsenceApply;
