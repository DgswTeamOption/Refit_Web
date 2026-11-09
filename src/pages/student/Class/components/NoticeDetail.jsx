import React from 'react';

/**
 * 공지사항 상세 뷰 (view8)
 */
function NoticeDetail({ notice, onBack }) {
    if (!notice) return null;

    return (
        <div className="notice-detail-view">
            <div className="content-card notice-detail-card">
                <span className="notice-detail-meta">
                    {notice.author} · {notice.date}
                </span>
                <h2 className="notice-detail-title">{notice.title}</h2>
                <div className="notice-detail-divider" />
                <div className="notice-detail-body">
                    {notice.content.map((paragraph, idx) => (
                        <p key={idx} className="notice-detail-paragraph">
                            {paragraph.startsWith('신청 링크:') ? (
                                <>
                                    신청 링크:{' '}
                                    <a href="#apply" className="notice-inline-link">
                                        https://refit.example/apply
                                    </a>
                                </>
                            ) : (
                                paragraph
                            )}
                        </p>
                    ))}
                </div>
                <div className="notice-detail-footer">
                    <button
                        type="button"
                        className="notice-back-btn"
                        onClick={onBack}
                    >
                        ‹ 공지 목록으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NoticeDetail;
