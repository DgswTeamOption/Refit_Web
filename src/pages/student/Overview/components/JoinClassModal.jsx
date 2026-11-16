import React from 'react';

/**
 * 수업 참여하기 모달 (view3)
 */
export default function JoinClassModal({
    isOpen,
    joinCode,
    joinError,
    errorMessage = '존재하지 않는 코드입니다.',
    isSubmitting = false,
    onChangeCode,
    onSubmit,
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
                <h3 className="overview-modal-title">수업 참여하기</h3>
                <p className="overview-modal-desc">수업코드를 입력해주세요.</p>

                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        className={`overview-modal-input ${joinError ? 'is-error' : ''}`}
                        placeholder="VswqGQtd"
                        value={joinCode}
                        onChange={(e) => onChangeCode(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                    />
                    {joinError && (
                        <p className="overview-modal-error-text">{errorMessage}</p>
                    )}

                    <div className="overview-modal-actions">
                        <button
                            type="button"
                            className="overview-modal-btn btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="overview-modal-btn btn-confirm-blue"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '참여 중...' : '참여하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
