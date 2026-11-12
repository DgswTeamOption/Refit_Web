import React from 'react';

/**
 * 수업 나가기 확인 모달 (view4)
 */
export default function LeaveClassModal({
    isOpen,
    onConfirm,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div className="overview-modal-overlay" onClick={onClose}>
            <div
                className="overview-modal-card"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <h3 className="overview-modal-title">수업에서 나가시겠어요?</h3>
                <p className="overview-modal-desc">수업 목록에서 더 이상 볼 수 없어요.</p>

                <div className="overview-modal-actions">
                    <button
                        type="button"
                        className="overview-modal-btn btn-cancel"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className="overview-modal-btn btn-confirm-red"
                        onClick={onConfirm}
                    >
                        나가기
                    </button>
                </div>
            </div>
        </div>
    );
}
