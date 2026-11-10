import React from 'react';
import Button from '../../../../components/Button/Button';
import HistoryTable from './HistoryTable';

/**
 * 보강 일정 탭 화면 (view11)
 */
function MakeupList({ items = [], onOpenApply, onCancel }) {
    return (
        <div className="class-makeup-tab-content">
            <div className="absence-section-header">
                <h2 className="content-section-title">신청 내역</h2>
                <Button
                    text="+ 보강 신청하기"
                    color="blue"
                    width={130}
                    onClick={onOpenApply}
                />
            </div>

            <div className="content-card absence-table-card">
                <HistoryTable
                    items={items}
                    contentLabel="보강 시간"
                    onCancel={onCancel}
                />
            </div>
        </div>
    );
}

export default MakeupList;
