import React, { useState } from 'react';
import Calendar from '../../../../components/Calendar/Calendar';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';
import { formatToKoreanDate } from '../constants';

/**
 * 보강 시간 제안 폼 및 신청 내역 화면 (view13)
 * - 학생이 원하는 날짜와 보강 시간을 직접 선택해 제안
 * - 달력 선택 시 현재 보고 있는 연·월 및 실제 출결 일정 반영
 * - 실패 시 상태 변경 없이 오류 메시지 표시
 */
function MakeupApply({
    items = [],
    classSchedules = [],
    calendarEvents = {},
    calendarYear,
    calendarMonth,
    onMonthChange,
    onSubmit,
    onCancel,
    onView,
}) {
    const [makeupDate, setMakeupDate] = useState('');
    const [makeupStartTime, setMakeupStartTime] = useState('');
    const [makeupEndTime, setMakeupEndTime] = useState('');
    const [makeupReason, setMakeupReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const firstSchedule = classSchedules[0];
    const defaultScheduleId =
        firstSchedule?.scheduleId ??
        firstSchedule?.schedule_id ??
        firstSchedule?.ruleId ??
        firstSchedule?.rule_id ??
        firstSchedule?.id ??
        null;

    const isTimeInvalid = Boolean(
        makeupStartTime &&
        makeupEndTime &&
        makeupStartTime >= makeupEndTime
    );

    const handleSelectDateFromCalendar = (day, year, month) => {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        setMakeupDate(`${year}-${monthStr}-${dayStr}`);
        setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!makeupDate || !makeupDate.trim()) {
            setSubmitError('보강을 원하는 날짜를 선택해주세요.');
            return;
        }
        if (!makeupStartTime) {
            setSubmitError('보강 시작 시간을 입력해주세요.');
            return;
        }
        if (isTimeInvalid) {
            setSubmitError('시작 시간은 종료 시간보다 앞서야 합니다.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const timeStr = makeupStartTime && makeupEndTime
                ? `${makeupStartTime} ~ ${makeupEndTime}`
                : makeupStartTime;

            await onSubmit({
                id: Date.now(),
                rawDate: makeupDate,
                isoMakeupTime: `${makeupDate}T${makeupStartTime}:00`,
                scheduleId: defaultScheduleId,
                date: formatToKoreanDate(makeupDate),
                time: timeStr,
                reason: makeupReason.trim() || '보강 시간 제안',
                status: '대기중',
                canCancel: true,
            });

            setMakeupDate('');
            setMakeupStartTime('');
            setMakeupEndTime('');
            setMakeupReason('');
        } catch (err) {
            setSubmitError(err?.message || '보강 신청에 실패했습니다. 다시 시도해주세요.');
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
                        selectedDate={makeupDate}
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
                            disabled={isSubmitting}
                            onChange={(e) => {
                                setMakeupDate(e.target.value);
                                setSubmitError('');
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
                                disabled={isSubmitting}
                                onChange={(e) => {
                                    setMakeupStartTime(e.target.value);
                                    setSubmitError('');
                                }}
                            />
                            <span className="apply-time-tilde">~</span>
                            <input
                                id="makeup-end-time"
                                type="time"
                                className={`apply-input apply-time-input ${isTimeInvalid ? 'input-error' : ''}`}
                                value={makeupEndTime}
                                disabled={isSubmitting}
                                onChange={(e) => {
                                    setMakeupEndTime(e.target.value);
                                    setSubmitError('');
                                }}
                            />
                        </div>
                        {isTimeInvalid && (
                            <p className="apply-error-message">
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
                            disabled={isSubmitting}
                            onChange={(e) => setMakeupReason(e.target.value)}
                        />

                        {submitError && (
                            <p className="apply-error-message" role="alert">
                                {submitError}
                            </p>
                        )}

                        <div className="apply-submit-btn-wrap">
                            <Button
                                text={isSubmitting ? '신청 중...' : '시간 제안하기'}
                                color="blue"
                                width={140}
                                type="submit"
                                disabled={isSubmitting || isTimeInvalid || !makeupDate || !makeupStartTime}
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
                        onView={onView}
                    />
                </div>
            </div>
        </div>
    );
}

export default MakeupApply;
