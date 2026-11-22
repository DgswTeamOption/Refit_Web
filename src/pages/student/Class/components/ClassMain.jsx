import React from 'react';
import Condition from '../../../../components/Condition/Condition';

const CONDITION_SUPPORTED = new Set([
    '결석', '거절됨', '출석', '수락됨', '보강', '대기중', '필요', '불필요',
]);

/**
 * 수업 메인 탭 콘텐츠 (view5)
 * - 이번달 출석 현황 요약 뱃지
 * - 최근 출석 테이블
 * - 공지사항 프리뷰 카드 및 더보기 링크
 */
function ClassMain({
    title,
    attendanceList = [],
    attendanceStats = null,
    notices = [],
    isLoading = false,
    onViewMoreNotices,
    onSelectNotice,
}) {
    const presentCount = attendanceStats?.presentCount ?? 0;
    const totalCount = attendanceStats?.totalCount ?? 0;
    const absentCount = attendanceStats?.absentCount ?? 0;

    // 날짜 최신순으로 최대 5건 표시
    const recentRows = [...attendanceList]
        .sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''))
        .slice(0, 5);

    const previewNotices = notices.slice(0, 2);

    return (
        <div className="class-main-tab-content">
            {/* 이번달 출석 현황 */}
            <section className="attendance-status-section">
                <div className="attendance-status-header">
                    <h2 className="content-section-title">이번달 출석 현황</h2>
                    <div className="attendance-pills">
                        <span className="attendance-pill pill-present">
                            출석 {presentCount}/{totalCount}
                        </span>
                        <span className="attendance-pill pill-absent">
                            결석 {absentCount}
                        </span>
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="table-empty-cell">
                                        출석 기록을 불러오는 중...
                                    </td>
                                </tr>
                            ) : recentRows.length > 0 ? (
                                recentRows.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.date || '-'}</td>
                                        <td>{row.className || title}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {CONDITION_SUPPORTED.has(row.status) ? (
                                                <Condition status={row.status} />
                                            ) : (
                                                <span className="status-fallback-text">{row.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="table-empty-cell">
                                        아직 출석 기록이 없어요.
                                    </td>
                                </tr>
                            )}
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
                    {isLoading ? (
                        <p className="empty-state-text">공지를 불러오는 중...</p>
                    ) : previewNotices.length > 0 ? (
                        previewNotices.map((notice, idx) => (
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
                                {idx < previewNotices.length - 1 && (
                                    <div className="notice-preview-divider" />
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="empty-state-text">등록된 공지가 없어요.</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ClassMain;
