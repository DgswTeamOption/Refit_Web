import React from 'react';
import Condition from '../../../../components/Condition/Condition';

const CONDITION_SUPPORTED = new Set([
    '결석', '거절됨', '출석', '수락됨', '보강', '대기중', '필요', '불필요',
]);

/**
 * 결석 및 보강 신청 내역 공통 테이블 컴포넌트
 */
function HistoryTable({
    items = [],
    contentLabel = '신청 내용',
    showTime = false,
    onCancel,
    onView = (item) => alert(`${item.date} 상세 정보`),
}) {
    const colSpan = showTime ? 5 : 4;

    return (
        <table className="class-table history-table">
            <thead>
                <tr>
                    <th>날짜</th>
                    {showTime && <th>보강 시간</th>}
                    <th>{contentLabel}</th>
                    <th style={{ textAlign: 'center' }}>상태</th>
                    <th style={{ textAlign: 'right' }}>관리</th>
                </tr>
            </thead>
            <tbody>
                {items.length > 0 ? (
                    items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.date}</td>
                            {showTime && <td>{item.time}</td>}
                            <td>{contentLabel === '보강 시간' ? item.time : item.reason}</td>
                            <td style={{ textAlign: 'center' }}>
                                {CONDITION_SUPPORTED.has(item.status) ? (
                                    <Condition status={item.status} />
                                ) : (
                                    <span className="status-fallback-text">{item.status}</span>
                                )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                {item.canCancel ? (
                                    <button
                                        type="button"
                                        className="table-action-btn btn-cancel-action"
                                        onClick={() => onCancel && onCancel(item.id)}
                                    >
                                        취소
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="table-action-btn"
                                        onClick={() => onView(item)}
                                    >
                                        {contentLabel === '보강 시간' ? '보기' : '상태 보기'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={colSpan} className="table-empty-cell">
                            신청 내역이 없어요.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default HistoryTable;
