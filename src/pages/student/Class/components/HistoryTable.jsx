import React from 'react';
import Condition from '../../../../components/Condition/Condition';

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
                {items.map((item) => (
                    <tr key={item.id}>
                        <td>{item.date}</td>
                        {showTime && <td>{item.time}</td>}
                        <td>{contentLabel === '보강 시간' ? item.time : item.reason}</td>
                        <td style={{ textAlign: 'center' }}>
                            <Condition status={item.status} />
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
                ))}
            </tbody>
        </table>
    );
}

export default HistoryTable;
