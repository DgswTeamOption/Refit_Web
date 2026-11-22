import React, { useState } from 'react';
import Calendar from '../../../../components/Calendar/Calendar';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';
import { formatToKoreanDate } from '../constants';

/**
 * 결석 신청 폼 및 신청 내역 화면 (view12)
 */
function AbsenceApply({
    items = [],
    calendarEvents = {},
    calendarYear,
    calendarMonth,
    onMonthChange,
    onSubmit,
    onCancel,
}) {
    const [absenceDate, setAbsenceDate] = useState('');
    const [absenceReason, setAbsenceReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // 달력에서 선택한 연·월·일을 YYYY-MM-DD 형식으로 저장
    const handleSelectDateFromCalendar = (day, year, month) => {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        setAbsenceDate(`${year}-${monthStr}-${dayStr}`);
        setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!absenceDate || !absenceDate.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError('');
        try {
            await onSubmit({
                id: Date.now(),
                rawDate: absenceDate,
                date: formatToKoreanDate(absenceDate),
                reason: absenceReason.trim() || '기타 사유',
                status: '대기중',
                canCancel: true,
            });
            setAbsenceDate('');
            setAbsenceReason('');
        } catch (err) {
            setSubmitError(err?.message || '결석 신청에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="apply-view-wrapper">
            <h2 className="apply-section-guide-title">신청할 날짜를 선택해주세요</h2>
            <div className="apply-two-columns">
                {/* 좌측 캘린더 (실제 출결 일정 및 연·월 연동) */}
                <div className="apply-calendar-column">
                    <Calendar
                        highlightToday
                        mode="attendance"
                        events={calendarEvents}
                        year={calendarYear}
                        month={calendarMonth}
                        onMonthChange={onMonthChange}
                        onSelectDate={handleSelectDateFromCalendar}
                        selectedDate={absenceDate}
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
                            disabled={isSubmitting}
                            onChange={(e) => {
                                setAbsenceDate(e.target.value);
                                setSubmitError('');
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
                            disabled={isSubmitting}
                            onChange={(e) => setAbsenceReason(e.target.value)}
                        />

                        {submitError && (
                            <p className="apply-error-message" role="alert">
                                {submitError}
                            </p>
                        )}

                        <div className="apply-submit-btn-wrap">
                            <Button
                                text={isSubmitting ? '신청 중...' : '신청하기'}
                                color="blue"
                                width={140}
                                type="submit"
                                disabled={isSubmitting}
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
                        onCancel={onCancel}
                    />
                </div>
            </div>
        </div>
    );
}

export default AbsenceApply;
