import { useEffect, useRef } from 'react';
import Button from '../../../../components/Button/Button.jsx';

function DeleteNoticeDialog({ title, onCancel, onConfirm }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="notice-delete-dialog"
            aria-labelledby="notice-delete-title"
            aria-describedby="notice-delete-description notice-delete-target"
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
        >
            <h2 id="notice-delete-title">공지를 삭제할까요?</h2>
            <p id="notice-delete-description">삭제한 공지는 학생에게 더 이상 보이지 않습니다.</p>
            <p id="notice-delete-target" className="notice-delete-dialog__target">{title}</p>
            <div className="notices-actions notice-delete-dialog__actions">
                <Button text="취소" color="lightGray" width={154} onClick={onCancel} />
                <Button text="공지 삭제" color="red" width={154} onClick={onConfirm} />
            </div>
        </dialog>
    );
}

export default function Notices({
    notice,
    isConfirmingDelete,
    onEdit,
    onRequestDelete,
    onCancelDelete,
    onConfirmDelete,
}) {
    return (
        <div className="notices-page">
            <article className="notice-detail" aria-labelledby="notice-detail-title">
                <div className="notice-detail__heading">
                    <p className="notices-meta">{notice.author} · {notice.date}</p>
                    <h2 id="notice-detail-title">{notice.title}</h2>
                </div>
                <p className="notice-detail__content">{notice.content}</p>
                <div className="notices-actions">
                    <Button text="공지 수정" color="lightGray" width={164} onClick={onEdit} />
                    <Button text="공지 삭제" color="red" width={150} onClick={onRequestDelete} />
                </div>
            </article>
            {isConfirmingDelete && (
                <DeleteNoticeDialog
                    title={notice.title}
                    onCancel={onCancelDelete}
                    onConfirm={onConfirmDelete}
                />
            )}
        </div>
    );
}
