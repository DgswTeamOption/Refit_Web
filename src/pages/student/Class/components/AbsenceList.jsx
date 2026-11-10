import React from 'react';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';

/**
 * 결석 일정 탭 화면 (view10)
 */
function AbsenceList({ items = [], onOpenApply, onCancel }) {
    return (
        <div className="class-absence-tab-content">
            <div className="absence-section-header">
                <h2 className="content-section-title">신청 내역</h2>
                <Button
                    text="+ 결석 신청하기"
                    color="blue"
                    width={130}
                    onClick={onOpenApply}
                />
            </div>

            <div className="content-card absence-table-card">
                <HistoryTable
                    items={items}
                    contentLabel="신청 내용"
                    onCancel={onCancel}
                />
            </div>
        </div>
    );
}

export default AbsenceList;
