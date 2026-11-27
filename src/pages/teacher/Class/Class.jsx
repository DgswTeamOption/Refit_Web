import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SubNav from '../../../components/SubNav/SubNav.jsx';
import Button from '../../../components/Button/Button.jsx';
import Nav from '../../../components/Nav/Nav.jsx';
import * as teacherApi from '../../../api/teacher.js';
import { getClassMakeups } from '../../../api/overviewApi.js';
import { currentPeriod, dateKey, noticeForView } from '../teacherViewData.js';
import ClassHome from './components/ClassHome.jsx';
import Notices from './notices/Notices.jsx';
import NoticesEditor from './notices/NoticesEditor.jsx';
import NoticesList from './notices/NoticesList.jsx';
import './Class.css';
import './notices/notices.css';

const VIEW_LABELS = { home: '수업 홈', list: '공지 목록', detail: '수업 공지', delete: '공지 삭제 확인', edit: '공지 수정', create: '공지 작성' };
const emptyResource = (data) => ({ data, loading: true, error: '' });

export default function Class() {
    const { classId } = useParams();
    if (!/^[1-9]\d*$/.test(classId || '')) {
        return (
            <main className="teacher-class__main">
                <p role="alert">유효한 수업이 아닙니다. 내 수업에서 수업을 다시 선택해주세요.</p>
                <Link to="/teacher">내 수업으로 이동</Link>
            </main>
        );
    }
    return <ClassPage key={classId} classId={classId} />;
}

function ClassPage({ classId }) {
    const navigate = useNavigate();
    const [period, setPeriod] = useState(currentPeriod);
    const [selectedDate, setSelectedDate] = useState(dateKey);
    const [home, setHome] = useState(() => emptyResource(null));
    const [summary, setSummary] = useState(() => emptyResource([]));
    const [makeups, setMakeups] = useState(() => emptyResource([]));
    const [notices, setNotices] = useState(() => emptyResource([]));
    const [attendance, setAttendance] = useState(() => emptyResource([]));
    const [detail, setDetail] = useState(() => emptyResource(null));
    const [view, setView] = useState({ type: 'home' });
    const [reload, setReload] = useState(0);
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState('');
    const bodyView = view.type === 'delete' ? 'detail' : view.type;

    useEffect(() => {
        const controller = new AbortController();
        getClassMakeups(classId, undefined, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setMakeups({ data: Array.isArray(data) ? data : [], loading: false, error: '' });
            })
            .catch((failure) => {
                if (!controller.signal.aborted) setMakeups({ data: [], loading: false, error: failure.message });
            });
        return () => controller.abort();
    }, [classId, reload]);

    useEffect(() => {
        const controller = new AbortController();
        const options = { year: period.year, month: period.month, signal: controller.signal };
        const requests = [
            [teacherApi.getClassroomHome(classId, options), setHome, null],
            [teacherApi.getAttendanceSummary(classId, options), setSummary, []],
            [teacherApi.listNotices(classId, options), setNotices, []],
        ];
        requests.forEach(([request, setResource, initial]) => {
            request.then((data) => {
                if (!controller.signal.aborted) setResource({ data, loading: false, error: '' });
            }).catch((failure) => {
                if (!controller.signal.aborted) setResource({ data: initial, loading: false, error: failure.message });
            });
        });
        return () => controller.abort();
    }, [classId, period.year, period.month, reload]);

    useEffect(() => {
        const controller = new AbortController();
        teacherApi.getClassAttendances(classId, selectedDate, { signal: controller.signal })
            .then((data) => { if (!controller.signal.aborted) setAttendance({ data, loading: false, error: '' }); })
            .catch((failure) => { if (!controller.signal.aborted) setAttendance({ data: [], loading: false, error: failure.message }); });
        return () => controller.abort();
    }, [classId, selectedDate, reload]);

    useEffect(() => {
        if (!view.noticeId) return;
        const controller = new AbortController();
        teacherApi.getNotice(classId, view.noticeId, { signal: controller.signal })
            .then((data) => { if (!controller.signal.aborted) setDetail({ data, loading: false, error: '' }); })
            .catch((failure) => { if (!controller.signal.aborted) setDetail({ data: null, loading: false, error: failure.message }); });
        return () => controller.abort();
    }, [classId, view.noticeId, reload]);

    useEffect(() => { window.scrollTo(0, 0); }, [bodyView]);

    function show(next) {
        if (saving) return;
        if (next.noticeId && next.noticeId !== view.noticeId) setDetail(emptyResource(null));
        setActionError('');
        setView(next);
    }

    function resetMonthResources() {
        setHome(emptyResource(null));
        setSummary(emptyResource([]));
        setNotices(emptyResource([]));
    }

    function retry() {
        resetMonthResources();
        setAttendance(emptyResource([]));
        if (view.noticeId) setDetail(emptyResource(null));
        setReload((value) => value + 1);
    }

    function changePeriod(next) {
        resetMonthResources();
        setAttendance(emptyResource([]));
        setPeriod(next);
        const today = dateKey();
        const first = next.year + '-' + String(next.month).padStart(2, '0') + '-01';
        setSelectedDate(today.slice(0, 7) === first.slice(0, 7) ? today : first);
    }

    function selectDate(value) {
        if (value === selectedDate) return;
        const [year, month] = value.split('-').map(Number);
        if (period.year !== year || period.month !== month) resetMonthResources();
        setAttendance(emptyResource([]));
        setPeriod((previous) => previous.year === year && previous.month === month ? previous : { year, month });
        setSelectedDate(value);
    }

    async function saveNotice(fields) {
        if (saving) return;
        setSaving(true);
        setActionError('');
        try {
            if (view.type === 'edit') await teacherApi.updateNotice(classId, view.noticeId, fields);
            else await teacherApi.createNotice(classId, fields);
            setView({ type: 'list' });
            retry();
        } catch (failure) {
            setActionError(failure.message);
        } finally {
            setSaving(false);
        }
    }

    async function removeNotice() {
        if (saving) return;
        setSaving(true);
        setActionError('');
        try {
            await teacherApi.deleteNotice(classId, view.noticeId);
            setView({ type: 'list' });
            retry();
        } catch (failure) {
            setActionError(failure.message);
        } finally {
            setSaving(false);
        }
    }

    const classTitle = home.data?.name || '수업';
    const selectedNotice = detail.data && String(detail.data.noticeId) === String(view.noticeId)
        ? noticeForView(detail.data, home.data?.teacherName) : null;
    let body;
    if (home.loading) {
        body = <p role="status">수업 정보를 불러오는 중입니다.</p>;
    } else if (home.error || !home.data) {
        body = <div role="alert"><p>{home.error || '수업 정보를 찾을 수 없습니다.'}</p><Button text="다시 시도" onClick={retry} /><Link to="/teacher">내 수업으로 이동</Link></div>;
    } else if (view.type === 'home') {
        body = <ClassHome classroom={home.data} makeups={makeups} period={period} onPeriodChange={changePeriod} selectedDate={selectedDate} onSelectDate={selectDate} summary={summary} attendance={attendance} notices={notices} onRetry={retry} onCreate={() => show({ type: 'create', from: 'home' })} onOpen={(noticeId) => show({ type: 'detail', noticeId })} onList={() => show({ type: 'list' })} />;
    } else if (view.type === 'create') {
        body = <NoticesEditor mode="create" saving={saving} error={actionError} onCancel={() => show({ type: view.from })} onSave={saveNotice} />;
    } else if (view.type === 'list') {
        body = <NoticesList notices={notices.data.map((item) => noticeForView(item, home.data.teacherName))} loading={notices.loading} error={notices.error} onRetry={retry} onCreate={() => show({ type: 'create', from: 'list' })} onOpen={(noticeId) => show({ type: 'detail', noticeId })} />;
    } else if (detail.loading) {
        body = <p role="status">공지를 불러오는 중입니다.</p>;
    } else if (detail.error || !selectedNotice) {
        body = <div role="alert"><p>{detail.error || '공지를 찾을 수 없습니다.'}</p><Button text="다시 시도" onClick={retry} /><Button text="공지 목록" onClick={() => show({ type: 'list' })} /></div>;
    } else if (view.type === 'edit') {
        body = <NoticesEditor key={selectedNotice.id} mode="edit" notice={selectedNotice} saving={saving} error={actionError} onCancel={() => show({ type: 'detail', noticeId: view.noticeId })} onSave={saveNotice} />;
    } else {
        body = <Notices notice={selectedNotice} saving={saving} error={actionError} isConfirmingDelete={view.type === 'delete'} onEdit={() => show({ type: 'edit', noticeId: view.noticeId })} onRequestDelete={() => show({ type: 'delete', noticeId: view.noticeId })} onCancelDelete={() => show({ type: 'detail', noticeId: view.noticeId })} onConfirmDelete={removeNotice} />;
    }

    return (
        <div className="teacher-class">
            <main className="teacher-class__main">
                <Nav label="현재 위치" items={[{ text: '홈', link: '/teacher' }, { text: classTitle, onClick: () => show({ type: 'home' }) }, { text: VIEW_LABELS[view.type] }]} />
                <h1 className="teacher-class__title">{classTitle}</h1>
                <SubNav activeKey="main" onChange={(key) => {
                    if (key === 'main') show({ type: 'home' });
                    else if (!saving) navigate('/teacher/class/' + classId + '/management?tab=' + key, { state: { classTitle } });
                }} />
                {body}
            </main>
        </div>
    );
}
