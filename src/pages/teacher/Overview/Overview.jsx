import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from '../../../components/Calendar/Calendar.jsx';
import Button from '../../../components/Button/Button.jsx';
import ClassBlock from '../../../components/ClassBlock/ClassBlock.jsx';
import { INITIAL_TEACHER_CLASSES } from '../classData.js';
import { getMonthlyCalendar } from '../../../api/teacher.js';
import {
    getTeacherClasses,
    createTeacherClass,
    deleteUploadedImage,
    deleteTeacherClass,
    getClassMakeups,
    uploadImage,
} from '../../../api/overviewApi.js';
import { currentPeriod } from '../teacherViewData.js';
import './Overview.css';

const MAX_VISIBLE_CLASSES = 4;
const CLASS_COLORS = [...new Set(INITIAL_TEACHER_CLASSES.map(({ color }) => color))];
const ACTIVE_MAKEUP_STATUSES = new Map([
    ['0', 'darkGray'],
    ['PENDING', 'darkGray'],
    ['WAITING', 'darkGray'],
    ['1', 'yellow'],
    ['APPROVED', 'yellow'],
]);

function extractItems(response, keys) {
    if (Array.isArray(response)) return response;
    const source = response?.data ?? response;
    if (Array.isArray(source)) return source;
    for (const key of keys) {
        if (Array.isArray(source?.[key])) return source[key];
    }
    return [];
}

function dayInPeriod(rawDate, { year, month }) {
    if (typeof rawDate !== 'string') return null;
    const match = rawDate.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (!match) return null;
    const [, rawYear, rawMonth, rawDay] = match;
    const day = Number(rawDay);
    return Number(rawYear) === year && Number(rawMonth) === month && day > 0 ? day : null;
}

function markCalendarDay(events, day, color) {
    if (!day) return;
    const markers = events[day] ??= [];
    if (!markers.includes(color)) markers.push(color);
}

function makeupMarker(makeup) {
    const status = makeup?.approvalStatus ?? makeup?.approval_status;
    return ACTIVE_MAKEUP_STATUSES.get(String(status ?? '').toUpperCase()) || '';
}

function formatClassList(list = []) {
    return list.map((item, index) => ({
        ...item,
        title: item.name,
        bannerImageUrl: item.bannerImageUrl || item.banner_image_url || item.imageUrl || item.image_url || '',
        color: CLASS_COLORS[index % CLASS_COLORS.length],
    }));
}

export default function Overview({ hidden }) {
    const [classes, setClasses] = useState([]);
    const [calendarPeriod, setCalendarPeriod] = useState(currentPeriod);
    const [calendarEvents, setCalendarEvents] = useState({});
    const [modal, setModal] = useState(null);
    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState('');
    const [bannerError, setBannerError] = useState('');
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dialogRef = useRef(null);
    const titleInputRef = useRef(null);
    const bannerInputRef = useRef(null);

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
        if (!bannerPreview) return undefined;
        return () => URL.revokeObjectURL(bannerPreview);
    }, [bannerPreview]);

    useEffect(() => {
        setCalendarEvents({});
        if (classes.length === 0) return undefined;

        let isMounted = true;
        const controller = new AbortController();
        async function loadCalendar() {
            const results = await Promise.all(classes.map(async (classItem) => {
                const [schedules, makeups] = await Promise.allSettled([
                    getMonthlyCalendar(classItem.id, {
                        year: calendarPeriod.year,
                        month: calendarPeriod.month,
                        signal: controller.signal,
                    }),
                    getClassMakeups(classItem.id, undefined, controller.signal),
                ]);
                return { schedules, makeups };
            }));

            if (!isMounted) return;

            const events = {};
            results.forEach(({ schedules, makeups }) => {
                if (schedules.status === 'fulfilled') {
                    extractItems(schedules.value, ['schedules', 'content', 'items', 'list'])
                        .forEach((schedule) => {
                            const startTime = schedule?.startTime ?? schedule?.start_time ?? schedule?.date;
                            markCalendarDay(events, dayInPeriod(startTime, calendarPeriod), 'blue');
                        });
                }

                if (makeups.status === 'fulfilled') {
                    extractItems(makeups.value, ['makeups', 'content', 'items', 'list'])
                        .forEach((makeup) => {
                            const color = makeupMarker(makeup);
                            if (!color) return;
                            const makeupTime = makeup?.makeupTime ?? makeup?.makeup_time;
                            markCalendarDay(events, dayInPeriod(makeupTime, calendarPeriod), color);
                        });
                }
            });

            setCalendarEvents(events);
        }

        loadCalendar();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [classes, calendarPeriod]);

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
        setBannerFile(null);
        setBannerPreview('');
        setBannerError('');
        setModal(null);
    }

    function openCreateModal() {
        setTitle('');
        setTitleError('');
        setBannerError('');
        setBannerFile(null);
        setBannerPreview('');
        if (bannerInputRef.current) bannerInputRef.current.value = '';
        setModal({ type: 'create' });
    }

    function handleBannerSelect(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setBannerFile(null);
            setBannerPreview('');
            setBannerError('이미지 파일을 선택해 주세요.');
            event.target.value = '';
            return;
        }
        setBannerError('');
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    }

    function clearBannerSelection() {
        setBannerFile(null);
        setBannerPreview('');
        setBannerError('');
        if (bannerInputRef.current) bannerInputRef.current.value = '';
    }

    async function handleCreateSubmit(event) {
        event.preventDefault();
        if (isSubmitting) return;
        if (bannerError) return;

        const classTitle = title.trim();

        if (!classTitle) {
            setTitleError('수업 제목을 입력해 주세요.');
            titleInputRef.current?.focus();
            return;
        }

        let uploadedFileId = null;
        try {
            setIsSubmitting(true);
            let bannerImageId;
            if (bannerFile) {
                const uploaded = await uploadImage(bannerFile);
                uploadedFileId = uploaded?.fileId;
                if (!uploadedFileId) throw new Error('수업 사진을 업로드하지 못했습니다.');
                bannerImageId = uploadedFileId;
            }

            const created = await createTeacherClass({ name: classTitle, bannerImageId });
            uploadedFileId = null;

            setClasses((previous) => formatClassList([created, ...previous]));
            setTitle('');
            setTitleError('');
            setBannerFile(null);
            setBannerPreview('');
            setModal(null);
        } catch (error) {
            if (uploadedFileId) {
                try {
                    await deleteUploadedImage(uploadedFileId);
                } catch {
                    // Preserve the class creation error for the user.
                }
            }
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
                    <Calendar
                        mode="teacher"
                        highlightToday
                        period={calendarPeriod}
                        onPeriodChange={setCalendarPeriod}
                        events={calendarEvents}
                    />
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
                                        bannerImageUrl={item.bannerImageUrl}
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
                                <input
                                    ref={bannerInputRef}
                                    className="overview-modal__file-input"
                                    type="file"
                                    accept="image/*"
                                    aria-label="수업 배너 사진 선택"
                                    onChange={handleBannerSelect}
                                />
                                <Button
                                    text={bannerFile ? '사진 변경' : '사진 선택'}
                                    color="lightGray"
                                    onClick={() => bannerInputRef.current?.click()}
                                />
                                {bannerPreview && (
                                    <div className="overview-modal__photo-preview">
                                        <img src={bannerPreview} alt="선택한 수업 배너 미리보기" />
                                        <span>{bannerFile?.name}</span>
                                        <Button text="삭제" color="lightGray" onClick={clearBannerSelection} />
                                    </div>
                                )}
                                {bannerError && <p className="overview-modal__error" role="alert">{bannerError}</p>}
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
