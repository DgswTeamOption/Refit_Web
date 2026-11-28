import React, { useState } from 'react';
import Calendar from '../../../../components/Calendar/Calendar';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';
import { formatToKoreanDate, formatToTime } from '../constants';

/**
 * 보강 신청 폼 및 신청 내역 화면 (view13)
 * - 기본 화면: 선생님이 등록한 보강 가능 시간 목록 + "보강 신청" 버튼 + 하단 "보강 시간 제안하기" 버튼
 * - 제안 모드("보강 시간 제안하기" 클릭 시): 학생 직접 날짜·시간 입력 + "시간 제안하기" 버튼
 * - 실패 시 상태 변경 없이 오류 메시지 표시
 */
function MakeupApply({
    items = [],
    availableSlots = [],
    calendarEvents = {},
    calendarYear,
    calendarMonth,
    onMonthChange,
    onSubmit,
    onCancel,
    onView,
}) {
    const [isProposeMode, setIsProposeMode] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [makeupDate, setMakeupDate] = useState('');
    const [makeupStartTime, setMakeupStartTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const hasServerSlots = availableSlots.length > 0;
    const selectedSlot = availableSlots.find((slot) => slot.id === selectedSlotId) || null;

    const handleSelectDateFromCalendar = (day, year, month) => {
        if (!isProposeMode) return;
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        setMakeupDate(`${year}-${monthStr}-${dayStr}`);
        setSubmitError('');
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlotId(selectedSlotId === slot.id ? null : slot.id);
        setSubmitError('');
    };

    const handleEnterProposeMode = () => {
        setSelectedSlotId(null);
        setIsProposeMode(true);
        setSubmitError('');
    };

    const handleExitProposeMode = () => {
        setIsProposeMode(false);
        setMakeupDate('');
        setMakeupStartTime('');
        setSubmitError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!isProposeMode) {
            if (!selectedSlot) {
                setSubmitError('신청 가능한 보강 시간을 선택해주세요.');
                return;
            }
        } else {
            if (!makeupDate || !makeupDate.trim()) {
                setSubmitError('보강을 원하는 날짜를 선택해주세요.');
                return;
            }
            if (!makeupStartTime) {
                setSubmitError('보강 시작 시간을 입력해주세요.');
                return;
            }
            if (new Date(`${makeupDate}T${makeupStartTime}:00`) < new Date()) {
                setSubmitError('지난 시간은 보강 시간으로 제안할 수 없습니다.');
                return;
            }
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            if (!isProposeMode && selectedSlot) {
                const slotDate = formatToKoreanDate(selectedSlot.makeup_time);
                const slotTime = formatToTime(selectedSlot.makeup_time) || '시간 미정';

                await onSubmit({
                    id: Date.now(),
                    isoMakeupTime: selectedSlot.makeup_time,
                    date: slotDate,
                    time: slotTime,
                    reason: '보강 신청',
                    status: '대기중',
                    canCancel: true,
                });
                setSelectedSlotId(null);
            } else {
                await onSubmit({
                    id: Date.now(),
                    isProposal: true,
                    rawDate: makeupDate,
                    isoMakeupTime: `${makeupDate}T${makeupStartTime}:00`,
                    date: formatToKoreanDate(makeupDate),
                    time: makeupStartTime,
                    reason: '보강 시간 제안',
                    status: '대기중',
                    canCancel: true,
                });
                setIsProposeMode(false);
            }

            setMakeupDate('');
            setMakeupStartTime('');
        } catch (err) {
            setSubmitError(err?.message || '보강 신청에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = isProposeMode
        ? (isSubmitting || !makeupDate || !makeupStartTime)
        : (isSubmitting || !selectedSlot);

    const calendarSelectedDate = isProposeMode
        ? makeupDate
        : (selectedSlot?.makeup_time ? String(selectedSlot.makeup_time).split('T')[0] : '');

    return (
        <div className="apply-view-wrapper">
            <h2 className="apply-section-guide-title">
                {isProposeMode ? '제안할 날짜와 시간을 선택해주세요' : '신청할 보강 시간을 선택해주세요'}
            </h2>
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
                        onSelectDate={isProposeMode ? handleSelectDateFromCalendar : undefined}
                        selectedDate={calendarSelectedDate}
                    />
                </div>

                {/* 우측 신청 정보 폼 */}
                <div className="apply-form-column">
                    <h3 className="apply-form-title">신청 정보</h3>
                    <form onSubmit={handleSubmit} className="apply-form-body">
                        {!isProposeMode ? (
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
                                        현재 등록된 보강 가능 시간이 없습니다.
                                    </div>
                                )}

                                <div className="makeup-propose-trigger-wrap">
                                    <button
                                        type="button"
                                        className="makeup-propose-trigger-btn"
                                        onClick={handleEnterProposeMode}
                                        disabled={isSubmitting}
                                    >
                                        보강 시간 제안하기
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="makeup-propose-header">
                                    <span className="makeup-propose-badge">직접 시간 제안</span>
                                    <button
                                        type="button"
                                        className="makeup-propose-back-btn"
                                        onClick={handleExitProposeMode}
                                        disabled={isSubmitting}
                                    >
                                        등록된 시간에서 선택하기
                                    </button>
                                </div>

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
                                    보강 시작 시간 <span style={{ color: '#F04444' }}>*</span>
                                </label>
                                <input
                                    id="makeup-start-time"
                                    type="time"
                                    required
                                    className="apply-input"
                                    value={makeupStartTime}
                                    disabled={isSubmitting}
                                    onChange={(e) => {
                                        setMakeupStartTime(e.target.value);
                                        setSubmitError('');
                                    }}
                                />
                            </>
                        )}

                        {submitError && (
                            <p className="apply-error-message" role="alert">
                                {submitError}
                            </p>
                        )}

                        <div className="apply-submit-btn-wrap">
                            <Button
                                text={isSubmitting ? '신청 중...' : isProposeMode ? '시간 제안하기' : '보강 신청'}
                                color="blue"
                                width={150}
                                type="submit"
                                disabled={isSubmitDisabled}
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
