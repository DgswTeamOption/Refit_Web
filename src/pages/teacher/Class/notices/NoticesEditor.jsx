import { useRef, useState } from 'react';
import Button from '../../../../components/Button/Button.jsx';

export default function NoticesEditor({ mode, notice, onCancel, onSave, saving = false, error = '' }) {
    const isEdit = mode === 'edit';
    const [title, setTitle] = useState(notice?.title ?? '');
    const [content, setContent] = useState(notice?.content ?? '');
    const [submitted, setSubmitted] = useState(false);
    const formRef = useRef(null);
    const titleRef = useRef(null);
    const contentRef = useRef(null);

    const titleMissing = submitted && !title.trim();
    const contentMissing = submitted && !content.trim();

    function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;
        setSubmitted(true);

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            titleRef.current.focus();
            return;
        }

        if (!content.trim()) {
            contentRef.current.focus();
            return;
        }

        onSave({ title: trimmedTitle, content });
    }

    return (
        <section className="notices-page" aria-labelledby="notice-editor-title">
            <h2 id="notice-editor-title" className="notices-heading">
                {isEdit ? '공지 수정' : '공지 작성'}
            </h2>
            <form ref={formRef} className="notices-editor" onSubmit={handleSubmit} noValidate>
                <div className="notices-editor__field">
                    <label htmlFor="notice-title">제목</label>
                    <input
                        ref={titleRef}
                        id="notice-title"
                        type="text"
                        value={title}
                        maxLength={100}
                        disabled={saving}
                        placeholder="공지 제목을 입력해주세요"
                        onChange={(event) => setTitle(event.target.value)}
                        aria-invalid={titleMissing}
                        aria-describedby={titleMissing ? 'notice-title-error' : undefined}
                        required
                    />
                    {titleMissing && (
                        <p className="notices-editor__error" id="notice-title-error" role="alert">
                            공지 제목을 입력해주세요.
                        </p>
                    )}
                </div>

                <div className="notices-editor__field">
                    <label htmlFor="notice-content">내용</label>
                    <textarea
                        ref={contentRef}
                        id="notice-content"
                        value={content}
                        maxLength={10000}
                        disabled={saving}
                        placeholder="공지 내용을 입력해주세요"
                        onChange={(event) => setContent(event.target.value)}
                        aria-invalid={contentMissing}
                        aria-describedby={contentMissing ? 'notice-content-error' : undefined}
                        required
                    />
                    {contentMissing && (
                        <p className="notices-editor__error" id="notice-content-error" role="alert">
                            공지 내용을 입력해주세요.
                        </p>
                    )}
                </div>
            </form>

            {error && <p className="notices-editor__error" role="alert">{error}</p>}

            <div className="notices-actions notices-editor__actions">
                <Button
                    text={isEdit ? '수정 취소' : '작성 취소'}
                    color="lightGray"
                    width={150}
                    onClick={onCancel}
                    disabled={saving}
                />
                <Button
                    text={saving ? '저장 중…' : isEdit ? '수정 완료' : '공지하기'}
                    width={164}
                    onClick={() => formRef.current.requestSubmit()}
                    disabled={saving}
                />
            </div>
        </section>
    );
}
