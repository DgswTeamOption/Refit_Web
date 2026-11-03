import { useEffect, useRef, useState } from 'react';
import Header from '../../../components/Header/Header.jsx';
import Calendar from '../../../components/Calendar/Calendar.jsx';
import Button from '../../../components/Button/Button.jsx';
import ClassBlock from '../../../components/ClassBlock/ClassBlock.jsx';
import './Overview.css';

const INITIAL_CLASSES = [
    { id: 'english1', title: '영어1', color: 'peach' },
    { id: 'english2', title: '영어2', color: 'lavender' },
    { id: 'math1', title: '수학1', color: 'yellow' },
    { id: 'math2', title: '수학2', color: 'mint' },
];

export default function Overview() {
    const [classes, setClasses] = useState(INITIAL_CLASSES);
    const [modal, setModal] = useState(null);
    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState('');

    const dialogRef = useRef(null);
    const titleInputRef = useRef(null);

    useEffect(() => {
        if (!modal) return;

        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        dialog.showModal();

        if (modal.type === 'create') {
            titleInputRef.current?.focus();
        }

        return () => {
            if (dialog.open) dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, [modal]);

    function closeModal() {
        setModal(null);
    }

    function openCreateModal() {
        setTitle('');
        setTitleError('');
        setModal({ type: 'create' });
    }

    function handleCreateSubmit(event) {
        event.preventDefault();

        const classTitle = title.trim();

        if (!classTitle) {
            setTitleError('수업 제목을 입력해 주세요.');
            titleInputRef.current?.focus();
            return;
        }

        // 기존 ClassBlock에서 지원하는 배경색
        const colors = ['peach', 'lavender', 'yellow', 'mint'];
        const randomColor = colors[
            Math.floor(Math.random() * colors.length)
            ];

        const newClass = {
            id: crypto.randomUUID(),
            title: classTitle,
            color: randomColor,
        };

        // 입력한 제목과 랜덤 색상으로 수업 카드 추가
        setClasses((previous) => [...previous, newClass]);

        setTitle('');
        setTitleError('');
        closeModal();
    }
    function handleDeleteClass() {
        if (modal?.type !== 'delete') return;

        const targetId = modal.item.id;

        setClasses((previous) => {
            // 현재 화면에 보이는 수업에서 선택한 수업 삭제
            const visible = previous
                .slice(0, 4)
                .filter((item) => item.id !== targetId);

            // 화면에 나오지 않는 수업들
            const hidden = previous.slice(4);

            // 숨겨진 수업 중 가장 최근에 만든 수업을 가져오기
            if (visible.length < 4 && hidden.length > 0) {
                visible.push(hidden.pop());
            }

            return [...visible, ...hidden];
        });

        closeModal();
    }

    return (
        <div className="teacher-overview">
            <Header />

            <main className="teacher-overview__main">
                <aside
                    className="teacher-overview__calendar"
                    aria-label="수업 달력"
                >
                    <Calendar />
                </aside>

                <section
                    className="teacher-overview__classes"
                    aria-labelledby="teacher-classes-title"
                >
                    <div className="teacher-overview__toolbar">
                        <h1 id="teacher-classes-title">내 수업</h1>

                        <div className="teacher-overview__create">
                            <Button
                                text="+ 수업 만들기"
                                color="blue"
                                width={174}
                                onClick={openCreateModal}
                            />
                        </div>
                    </div>

                    {classes.length > 0 ? (
                        <div className="teacher-overview__grid">
                            {classes.slice(0, 4).map((item) => (
                                <ClassBlock
                                    key={item.id}
                                    title={item.title}
                                    color={item.color}
                                    onLeave={() => setModal({ type: 'delete', item })}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="teacher-overview__empty">
                            <div className="teacher-overview__empty-content">
                                <p>아직 참여한 수업이 없어요</p>

                                <Button
                                    text="수업 만들기"
                                    color="blue"
                                    width={164}
                                    onClick={openCreateModal}
                                />
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {modal && (
                <dialog
                    ref={dialogRef}
                    className={`overview-modal overview-modal--${modal.type}`}
                    aria-labelledby="overview-modal-title"
                    aria-describedby={
                        modal.type === 'delete'
                            ? 'overview-modal-description'
                            : undefined
                    }
                    onCancel={closeModal}
                >
                    {modal.type === 'create' ? (
                        <>
                            <h2 id="overview-modal-title">수업 만들기</h2>

                            <form onSubmit={handleCreateSubmit} noValidate>
                                <label
                                    className="overview-modal__label"
                                    htmlFor="class-title"
                                >
                                    수업 제목 <span aria-hidden="true">*</span>
                                </label>

                                <input
                                    ref={titleInputRef}
                                    id="class-title"
                                    name="classTitle"
                                    className="overview-modal__input"
                                    type="text"
                                    placeholder="수업 제목을 입력해주세요"
                                    autoComplete="off"
                                    required
                                    value={title}
                                    aria-invalid={Boolean(titleError)}
                                    aria-describedby={
                                        titleError ? 'class-title-error' : undefined
                                    }
                                    onChange={(event) => {
                                        setTitle(event.target.value);
                                        setTitleError('');
                                    }}
                                />

                                {titleError && (
                                    <p
                                        id="class-title-error"
                                        className="overview-modal__error"
                                        role="alert"
                                    >
                                        {titleError}
                                    </p>
                                )}
                            </form>
                            <div className="overview-modal__photo">
                                <p className="overview-modal__label">배너 사진</p>

                                <Button
                                    text="사진 선택"
                                    color="lightGray"
                                    disabled
                                />
                            </div>

                            <div className="overview-modal__actions">
                                <Button
                                    text="취소"
                                    color="lightGray"
                                    onClick={closeModal}
                                />
                                <Button
                                    text="만들기"
                                    color="blue"
                                    onClick={handleCreateSubmit}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 id="overview-modal-title">
                                수업을 삭제하시겠어요?
                            </h2>

                            <p
                                id="overview-modal-description"
                                className="overview-modal__description"
                            >
                                수업과 관련 정보가 삭제됩니다.
                            </p>

                            <div className="overview-modal__actions">
                                <Button
                                    text="취소"
                                    color="lightGray"
                                    onClick={closeModal}
                                />
                                <Button
                                    text="삭제"
                                    color="red"
                                    onClick={handleDeleteClass}
                                />
                            </div>
                        </>
                    )}
                </dialog>
            )}
        </div>
    );
}