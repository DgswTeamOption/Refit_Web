import React, { useState } from 'react';
import Calendar from '../../../../components/Calendar/Calendar';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';
import { formatToKoreanDate, formatToTime } from '../constants';

/**
 * 보강 신청 폼 및 신청 내역 화면 (view13)
 * - 서버 연동 시 실제 신청 가능 슬롯(availableSlots)의 schedule_id와 makeup_time 사용
 * - 달력 선택 시 현재 보고 있는 연·월 및 실제 출결 일정 반영
 * - 실패 시 상태 변경 없이 오류 메시지 표시
 */
function MakeupApply({
    items = [],
    availableSlots = [],
    isServerMode = false,
    calendarEvents = {},
    calendarYear,
    calendarMonth,
    onMonthChange,
    onSubmit,
    onCancel,
}) {
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [makeupDate, setMakeupDate] = useState('');
    const [makeupStartTime, setMakeupStartTime] = useState('');
    const [makeupEndTime, setMakeupEndTime] = useState('');
    const [makeupReason, setMakeupReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const hasServerSlots = availableSlots.length > 0;
    const selectedSlot = availableSlots.find((slot) => slot.id === selectedSlotId) || null;

    const isTimeInvalid = Boolean(
        !hasServerSlots && makeupStartTime && makeupEndTime && makeupStartTime >= makeupEndTime
    );

    const handleSelectDateFromCalendar = (day, year, month) => {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        setMakeupDate(`${year}-${monthStr}-${dayStr}`);
        setSubmitError('');
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlotId(slot.id);
        if (slot.makeup_time) {
            setMakeupDate(String(slot.makeup_time).split('T')[0]);
        }
        setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // 서버 모드일 때는 반드시 실제 가능 슬롯 선택 필요
        if (isServerMode && !selectedSlot) {
            setSubmitError(
                hasServerSlots
                    ? '신청 가능한 보강 시간을 선택해주세요.'
                    : '현재 신청 가능한 보강 시간이 없습니다.'
            );
            return;
        }

        if (!hasServerSlots && (!makeupDate || !makeupDate.trim() || isTimeInvalid)) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            if (selectedSlot) {
                const slotDate = formatToKoreanDate(selectedSlot.makeup_time);
                const slotTime = formatToTime(selectedSlot.makeup_time) || '시간 미정';

                await onSubmit({
                    id: Date.now(),
                    scheduleId: selectedSlot.schedule_id,
                    isoMakeupTime: selectedSlot.makeup_time,
                    date: slotDate,
                    time: slotTime,
                    reason: makeupReason.trim() || '보강 신청',
                    status: '대기중',
                    canCancel: true,
                });
                setSelectedSlotId(null);
            } else {
                const timeStr = makeupStartTime && makeupEndTime
                    ? `${makeupStartTime} ~ ${makeupEndTime}`
                    : (makeupStartTime || makeupEndTime || '16:00 ~ 17:00');
                const startPart = makeupStartTime || '16:00';

                await onSubmit({
                    id: Date.now(),
                    rawDate: makeupDate,
                    isoMakeupTime: new Date(`${makeupDate}T${startPart}:00`).toISOString(),
                    scheduleId: 0,
                    date: formatToKoreanDate(makeupDate),
                    time: timeStr,
                    reason: makeupReason.trim() || '기타 사유',
                    status: '대기중',
                    canCancel: true,
                });
            }

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
                        {isServerMode || hasServerSlots ? (
                            <>
                                <label className="apply-field-label">
                                    신청 가능한 보강 시간 <span style={{ color: '#F04444' }}>*</span>
                                </label>
                                {hasServerSlots ? (
                                    <div className="makeup-slot-list">
                                        {availableSlots.map((slot) => {
                                            const isDisabled = slot.is_full || slot.remaining_capacity === 0;
                                            const isSelected = selectedSlotId === slot.id;
                                            const dateLabel = formatToKoreanDate(slot.makeup_time);
                                            const timeLabel = formatToTime(slot.makeup_time);

                                            return (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    className={`makeup-slot-item ${isSelected ? 'is-selected' : ''}`}
                                                    disabled={isDisabled || isSubmitting}
                                                    onClick={() => handleSelectSlot(slot)}
                                                >
                                                    <span>{dateLabel} {timeLabel}</span>
                                                    <span className="makeup-slot-capacity">
                                                        {isDisabled
                                                            ? '마감'
                                                            : `잔여 ${slot.remaining_capacity ?? slot.capacity}명`}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="makeup-slot-empty">
                                        현재 신청 가능한 보강 시간이 없습니다.
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
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
                                        onChange={(e) => setMakeupStartTime(e.target.value)}
                                    />
                                    <span className="apply-time-tilde">~</span>
                                    <input
                                        id="makeup-end-time"
                                        type="time"
                                        required
                                        className={`apply-input apply-time-input ${isTimeInvalid ? 'input-error' : ''}`}
                                        value={makeupEndTime}
                                        disabled={isSubmitting}
                                        onChange={(e) => setMakeupEndTime(e.target.value)}
                                    />
                                </div>
                                {isTimeInvalid && (
                                    <p className="apply-error-message">
                                        시작 시간은 종료 시간보다 앞서야 합니다.
                                    </p>
                                )}
                            </>
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
                                text={isSubmitting ? '신청 중...' : '신청하기'}
                                color="blue"
                                width={140}
                                type="submit"
                                disabled={
                                    isTimeInvalid ||
                                    isSubmitting ||
                                    (isServerMode && !selectedSlot)
                                }
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
