import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from '../../../components/Calendar/Calendar.jsx';
import Button from '../../../components/Button/Button.jsx';
import ClassBlock from '../../../components/ClassBlock/ClassBlock.jsx';
import { INITIAL_TEACHER_CLASSES } from '../classData.js';
import {
    getTeacherClasses,
    createTeacherClass,
    deleteTeacherClass,
} from '../../../api/overviewApi.js';
import './Overview.css';

const MAX_VISIBLE_CLASSES = 4;
const CLASS_COLORS = [...new Set(INITIAL_TEACHER_CLASSES.map(({ color }) => color))];

function formatClassList(list = []) {
    return list.map((item, index) => ({
        ...item,
        title: item.name,
        color: CLASS_COLORS[index % CLASS_COLORS.length],
    }));
}

export default function Overview({ hidden }) {
    const [classes, setClasses] = useState([]);
    const [modal, setModal] = useState(null);
    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dialogRef = useRef(null);
    const titleInputRef = useRef(null);

    useEffect(() => {
        async function fetchClasses() {
            try {
                const data = await getTeacherClasses();
                setClasses(formatClassList(data));
            } catch (error) {
                console.error('수업 목록 조회 실패:', error);
            }
        }
        fetchClasses();
    }, []);

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
        if (isSubmitting) return;
        setModal(null);
    }

    function openCreateModal() {
        setTitle('');
        setTitleError('');
        setModal({ type: 'create' });
    }

    async function handleCreateSubmit(event) {
        event.preventDefault();
        if (isSubmitting) return;

        const classTitle = title.trim();

        if (!classTitle) {
            setTitleError('수업 제목을 입력해 주세요.');
            titleInputRef.current?.focus();
            return;
        }

        try {
            setIsSubmitting(true);
            const created = await createTeacherClass({ name: classTitle });

            setClasses((previous) => formatClassList([created, ...previous]));
            setTitle('');
            setTitleError('');
            setModal(null);
        } catch (error) {
            setTitleError(error.message || '수업 생성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteClass() {
        if (modal?.type !== 'delete' || isSubmitting) return;

        const targetId = modal.item.id;

        try {
            setIsSubmitting(true);
            await deleteTeacherClass(targetId);

            setClasses((previous) => {
                const visible = previous
                    .slice(0, MAX_VISIBLE_CLASSES)
                    .filter((item) => item.id !== targetId);

                const hiddenList = previous.slice(MAX_VISIBLE_CLASSES);

                if (visible.length < MAX_VISIBLE_CLASSES && hiddenList.length > 0) {
                    visible.push(hiddenList.shift());
                }

                return [...visible, ...hiddenList];
            });

            setModal(null);
        } catch (error) {
            alert(error.message || '수업 삭제에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="teacher-overview" hidden={hidden}>
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
                            {classes.slice(0, MAX_VISIBLE_CLASSES).map((item) => (
                                <div key={item.id} className="teacher-overview__class-card">
                                    <ClassBlock
                                        title={item.title}
                                        color={item.color}
                                        onLeave={() => setModal({ type: 'delete', item })}
                                    />
                                    <Link
                                        className="teacher-overview__class-link"
                                        to={'/teacher/class/' + item.id}
                                        state={{ classTitle: item.title }}
                                        aria-label={item.title + ' 수업 열기'}
                                    />
                                </div>
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