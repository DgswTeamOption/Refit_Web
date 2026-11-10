import React from 'react';
import Condition from '../../../../components/Condition/Condition';

/**
 * 수업 메인 탭 콘텐츠 (view5)
 * - 이번달 출석 현황 요약 뱃지
 * - 최근 출석 테이블
 * - 공지사항 프리뷰 카드 및 더보기 링크
 */
function ClassMain({ title, notices = [], onViewMoreNotices, onSelectNotice }) {
    return (
        <div className="class-main-tab-content">
            {/* 이번달 출석 현황 */}
            <section className="attendance-status-section">
                <div className="attendance-status-header">
                    <h2 className="content-section-title">이번달 출석 현황</h2>
                    <div className="attendance-pills">
                        <span className="attendance-pill pill-present">출석 3/9</span>
                        <span className="attendance-pill pill-absent">결석 5</span>
                    </div>
                </div>

                {/* 최근 출석 카드 */}
                <div className="content-card recent-attendance-card">
                    <h3 className="card-subtitle">최근 출석</h3>
                    <table className="class-table">
                        <thead>
                            <tr>
                                <th>날짜</th>
                                <th>수업</th>
                                <th style={{ textAlign: 'right' }}>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2026년 8월 27일</td>
                                <td>{title}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <Condition status="출석" />
                                </td>
                            </tr>
                            <tr>
                                <td>2026년 8월 25일</td>
                                <td>{title}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <Condition status="결석" />
                                </td>
                            </tr>
                            <tr>
                                <td>2026년 8월 20일</td>
                                <td>{title}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <Condition status="보강" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 공지 섹션 */}
            <section className="notice-section">
                <div className="notice-section-header">
                    <h2 className="content-section-title">공지</h2>
                    <button
                        type="button"
                        className="view-more-link"
                        onClick={onViewMoreNotices}
                    >
                        더보기
                    </button>
                </div>

                <div className="content-card notice-preview-card">
                    {notices.slice(0, 2).map((notice, idx) => (
                        <div
                            key={notice.id}
                            className="notice-preview-item"
                            onClick={() => onSelectNotice(notice)}
                        >
                            <span className="notice-preview-meta">
                                {notice.author} · {notice.date}
                            </span>
                            <h3 className="notice-preview-title">{notice.title}</h3>
                            <p className="notice-preview-desc">{notice.excerpt}</p>
                            {idx === 0 && <div className="notice-preview-divider" />}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ClassMain;
