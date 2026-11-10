import React from 'react';

/**
 * 공지사항 목록 뷰 (view7)
 */
function NoticeList({ notices = [], onSelectNotice }) {
    return (
        <div className="notice-list-view">
            <h2 className="notice-view-title">공지 목록</h2>
            <div className="notice-card-list">
                {notices.map((notice) => (
                    <div
                        key={notice.id}
                        className="notice-item-card"
                        onClick={() => onSelectNotice(notice)}
                    >
                        <div className="notice-item-body">
                            <span className="notice-item-meta">
                                {notice.author} · {notice.date}
                            </span>
                            <h3 className="notice-item-title">{notice.title}</h3>
                            <p className="notice-item-excerpt">{notice.excerpt}</p>
                        </div>
                        <button
                            type="button"
                            className="notice-view-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectNotice(notice);
                            }}
                        >
                            공지 보기
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NoticeList;
