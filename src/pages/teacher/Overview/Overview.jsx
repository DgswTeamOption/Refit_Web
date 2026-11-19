import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button/Button.jsx';
import { createClassroom, deleteClassroom, getMonthlyCalendar, listClassrooms, uploadImage } from '../../../api/teacher.js';
import OverviewCalendar from './components/OverviewCalendar.jsx';
import { classColor, currentPeriod } from '../teacherViewData.js';
import '../../../components/ClassBlock/ClassBlock.css';
import './Overview.css';

export default function Overview({ hidden }) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [period, setPeriod] = useState(currentPeriod);
    const [calendar, setCalendar] = useState({ schedules: [], loading: false, error: '' });
    const [modal, setModal] = useState(null);
    const [title, setTitle] = useState('');
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState(null);
    const uploadedImage = useRef(null);
    const dialogRef = useRef(null);
    const titleInputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        listClassrooms({ signal: controller.signal })
            .then((items) => {
                if (controller.signal.aborted) return;
                setClasses(items);
                setCalendar({ schedules: [], loading: items.length > 0, error: '' });
            })
            .catch((failure) => { if (!controller.signal.aborted) setError(failure.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [reload]);

    useEffect(() => {
        const controller = new AbortController();
        if (classes.length) {
            Promise.allSettled(classes.map((item) => getMonthlyCalendar(item.id, { ...period, signal: controller.signal })))
                .then((results) => {
                    if (controller.signal.aborted) return;
                    const failed = results.find((result) => result.status === 'rejected');
                    setCalendar({
                        schedules: results.flatMap((result) => result.status === 'fulfilled' ? result.value : []),
                        loading: false,
                        error: failed ? '일부 수업 일정을 불러오지 못했습니다. ' + failed.reason.message : '',
                    });
                });
        }
        return () => controller.abort();
    }, [classes, period]);

    useEffect(() => {
        if (!modal) return;
        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        if (modal.type === 'create') titleInputRef.current?.focus();
        return () => {
            if (dialog.open) dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, [modal]);

    function closeModal() {
        if (saving) return;
        setModal(null);
        clearFile();
    }

    function clearFile() {
        setFile(null);
        uploadedImage.current = null;
    }

    function reloadClasses() {
        setLoading(true);
        setError('');
        setReload((value) => value + 1);
    }

    function changePeriod(next) {
        setCalendar({ schedules: [], loading: classes.length > 0, error: '' });
        setPeriod(next);
    }

    function openCreateModal() {
        setTitle('');
        clearFile();
        setModalError('');
        uploadedImage.current = null;
        setModal({ type: 'create' });
    }

    async function handleCreateSubmit(event) {
        event.preventDefault();
        if (saving) return;
        const name = title.trim();
        if (!name || name.length > 50) {
            setModalError('수업 제목을 1~50자로 입력해주세요.');
            titleInputRef.current?.focus();
            return;
        }
        setSaving(true);
        setModalError('');
        try {
            let bannerImageId;
            if (file) {
                if (uploadedImage.current?.file !== file) {
                    uploadedImage.current = { file, response: await uploadImage(file) };
                }
                bannerImageId = uploadedImage.current.response.fileId;
            }
            await createClassroom({ name, ...(bannerImageId ? { bannerImageId } : {}) });
            setModal(null);
            clearFile();
            reloadClasses();
        } catch (failure) {
            setModalError(failure.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteClass() {
        if (modal?.type !== 'delete' || saving) return;
        setSaving(true);
        setModalError('');
        try {
            await deleteClassroom(modal.item.id);
            setModal(null);
            reloadClasses();
        } catch (failure) {
            setModalError(failure.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="teacher-overview" hidden={hidden}>
            <main className="teacher-overview__main">
                <aside className="teacher-overview__calendar" aria-label="수업 달력">
                    <OverviewCalendar period={period} onPeriodChange={changePeriod} schedules={calendar.schedules} classes={classes} />
                    {calendar.loading && <p role="status">수업 일정을 불러오는 중입니다.</p>}
                    {calendar.error && <p role="alert">{calendar.error}</p>}
                </aside>
                <section className="teacher-overview__classes" aria-labelledby="teacher-classes-title" aria-busy={loading}>
                    <div className="teacher-overview__toolbar">
                        <h1 id="teacher-classes-title">내 수업</h1>
                        <div className="teacher-overview__create">
                            <Button text="+ 수업 만들기" width={174} disabled={loading || Boolean(error)} onClick={openCreateModal} />
                        </div>
                    </div>
                    {loading ? <p role="status">수업 목록을 불러오는 중입니다.</p> : error ? (
                        <div role="alert">
                            <p>{error}</p>
                            <Button text="다시 시도" width={110} onClick={reloadClasses} />
                        </div>
                    ) : classes.length ? (
                        <div className="teacher-overview__grid">
                            {classes.map((item) => (
                                <div key={item.id} className="teacher-overview__class-card">
                                    <article className="class-block">
                                        <div className="class-block__banner" style={{ background: {
                                            peach: 'linear-gradient(to bottom right, #F5AA8C, #FFE0A1)',
                                            lavender: 'linear-gradient(to bottom right, #BBA8F6, #E8D6FF)',
                                            yellow: 'linear-gradient(to bottom right, #FFC45B, #FFE9A2)',
                                            mint: 'linear-gradient(to bottom right, #82D2BC, #C8EFE2)',
                                        }[classColor(item.id)] }} aria-hidden="true">
                                            {item.bannerImageUrl && <img src={item.bannerImageUrl} alt="" />}
                                        </div>
                                        <div className="class-block__body">
                                            <h3 className="class-block__title">{item.name}</h3>
                                            <button type="button" className="class-block__leave" aria-label={item.name + ' 수업 삭제'} onClick={() => { setModalError(''); setModal({ type: 'delete', item }); }}>수업 삭제</button>
                                        </div>
                                    </article>
                                    <Link className="teacher-overview__class-link" to={'/teacher/class/' + item.id} state={{ classTitle: item.name }} aria-label={item.name + ' 수업 열기'} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="teacher-overview__empty">
                            <div className="teacher-overview__empty-content">
                                <p>아직 참여한 수업이 없어요</p>
                                <Button text="수업 만들기" width={164} onClick={openCreateModal} />
                            </div>
                        </div>
                    )}
                </section>
            </main>
            {modal && (
                <dialog ref={dialogRef} className={'overview-modal overview-modal--' + modal.type} aria-labelledby="overview-modal-title" aria-busy={saving} onCancel={(event) => { event.preventDefault(); closeModal(); }}>
                    <h2 id="overview-modal-title">{modal.type === 'create' ? '수업 만들기' : '수업을 삭제하시겠어요?'}</h2>
                    {modal.type === 'create' ? (
                        <form onSubmit={handleCreateSubmit} noValidate>
                            <label className="overview-modal__label" htmlFor="class-title">수업 제목 <span aria-hidden="true">*</span></label>
                            <input ref={titleInputRef} id="class-title" className="overview-modal__input" placeholder="수업 제목을 입력해주세요" value={title} maxLength={50} required disabled={saving} onChange={(event) => setTitle(event.target.value)} />
                            <div className="overview-modal__photo">
                                <p className="overview-modal__label">배너 사진</p>
                                <input ref={fileInputRef} id="class-banner" type="file" accept="image/*" hidden disabled={saving} onChange={(event) => {
                                    const selected = event.target.files?.[0];
                                    if (selected && !selected.type.startsWith('image/')) {
                                        clearFile();
                                        setModalError('이미지 파일을 선택해주세요.');
                                        event.target.value = '';
                                        return;
                                    }
                                    setFile(selected || null);
                                    uploadedImage.current = null;
                                    setModalError('');
                                }} />
                                <Button text={file ? '사진 다시 선택' : '사진 선택'} color="lightGray" disabled={saving} onClick={(event) => { event.preventDefault(); fileInputRef.current?.click(); }} />
                            </div>
                            {modalError && <p className="overview-modal__error" role="alert">{modalError}</p>}
                            <div className="overview-modal__actions">
                                <Button text="취소" color="lightGray" disabled={saving} onClick={(event) => { event.preventDefault(); closeModal(); }} />
                                <Button text={saving ? '만드는 중…' : '만들기'} disabled={saving} onClick={handleCreateSubmit} />
                            </div>
                        </form>
                    ) : (
                        <>
                            <p className="overview-modal__description">{modal.item.name} 수업과 관련 정보가 삭제됩니다.</p>
                            {modalError && <p className="overview-modal__error" role="alert">{modalError}</p>}
                            <div className="overview-modal__actions">
                                <Button text="취소" color="lightGray" disabled={saving} onClick={closeModal} />
                                <Button text={saving ? '삭제 중…' : '삭제'} color="red" disabled={saving} onClick={handleDeleteClass} />
                            </div>
                        </>
                    )}
                </dialog>
            )}
        </div>
    );
}
