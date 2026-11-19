import { useRef, useState } from 'react';

export default function ClassCodeCard({ classCode }) {
    const codeInput = useRef(null);
    const [feedback, setFeedback] = useState('');

    async function copyClassCode() {
        try {
            await navigator.clipboard.writeText(classCode);
            setFeedback('수업 코드를 복사했어요.');
        } catch {
            codeInput.current?.focus();
            codeInput.current?.select();
            setFeedback('선택된 코드를 직접 복사해주세요.');
        }
    }

    return (
        <section className="teacher-class__code-card" aria-labelledby="class-code-title">
            <h2 id="class-code-title">수업 코드</h2>
            <p>학생에게 이 코드를 공유해 수업에 초대하세요.</p>
            <div className="teacher-class__code-controls">
                <input ref={codeInput} className="teacher-class__code-value" type="text" value={classCode} readOnly aria-label="수업 코드" />
                <button type="button" className="teacher-class__copy-code" onClick={copyClassCode}>
                    <span className="teacher-class__copy-icon" aria-hidden="true" />
                    복사
                </button>
            </div>
            <p className="teacher-class__copy-feedback" role="status">{feedback}</p>
        </section>
    );
}
