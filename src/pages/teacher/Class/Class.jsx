import { useEffect, useState } from 'react';
import SubNav from '../../../components/SubNav/SubNav.jsx';
import Calendar from '../../../components/Calendar/Calendar.jsx';
import Condition from '../../../components/Condition/Condition.jsx';
import Button from '../../../components/Button/Button.jsx';
import Notices from './notices/Notices.jsx';
import NoticesEditor from './notices/NoticesEditor.jsx';
import NoticesList from './notices/NoticesList.jsx';
import './Class.css';
import './notices/notices.css';

const RECENT_ATTENDANCE = [
    { date: '8월 27일', status: '출석' },
    { date: '8월 25일', status: '결석' },
    { date: '8월 20일', status: '보강' },
];

const NOTICE_AUTHOR = '선생님';
const INITIAL_NOTICES = [
    {
        id: 'presentation',
        author: NOTICE_AUTHOR,
        date: '2026. 08. 20',
        title: '(역량 수행평가안내) 자기성장보고서 & 북 프리젠테이션',
        content: [
            '재학생을 대상으로 특강을 할 학생 전문가를 모집합니다.',
            '신청 링크에서 신청서를 작성해주세요.',
            '1. 대상: 재학생 전체',
            '2. 모집 기간: ~ 2026. 9. 11 (금)까지',
            '3. 특강 가능 일시: 설문 참고',
            '4. 특강 시간: 40분 ~ 50분',
            '5. 참여 학생 지원 사항: 필요한 자료 및 도서를 구입할 수 있는 문화상품권 25,000원 증정',
            '신청 링크: https://refit.example/apply',
        ].join('\n'),
    },
    {
        id: 'semester',
        author: NOTICE_AUTHOR,
        date: '2026. 08. 18',
        title: '2학기 수업 일정 안내',
        content: '이번 달 수업 및 보강 일정을 안내합니다.',
    },
    {
        id: 'textbook',
        author: NOTICE_AUTHOR,
        date: '2026. 08. 20',
        title: '교재 준비 안내',
        content: '다음 수업 전까지 교재를 준비해주세요.',
    },
];

const CLASS_TITLE = '영어1';
const NOTICE_STORAGE_KEY = 'refit:teacher:english1:notices';
const NOTICE_DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
const VIEW_LABELS = {
    home: '수업 홈',
    list: '공지 목록',
    detail: '수업 공지',
    delete: '공지 삭제 확인',
    edit: '공지 수정',
    create: '공지 작성',
};

function readNotices() {
    try {
        const storedNotices = JSON.parse(sessionStorage.getItem(NOTICE_STORAGE_KEY));
        return Array.isArray(storedNotices) ? storedNotices : INITIAL_NOTICES;
    } catch {
        return INITIAL_NOTICES;
    }
}

function ClassHome({ notices, onCreate, onList }) {
    return (
        <div className="teacher-class__layout">
            <aside className="teacher-class__calendar" aria-label="수업 달력">
                <Calendar />
            </aside>

            <div className="teacher-class__content">
                <section className="teacher-class__summary" aria-labelledby="class-attendance-title">
                    <h2 id="class-attendance-title">이번달 출석 현황</h2>
                    <div className="teacher-class__totals">
                        <div className="teacher-class__total teacher-class__total--attendance" aria-label="출석 12회 중 10회">
                            <Condition status="출석" /><span>10/12</span>
                        </div>
                        <div className="teacher-class__total teacher-class__total--absence" aria-label="결석 1회">
                            <Condition status="결석" /><span>1</span>
                        </div>
                    </div>
                </section>

                <section className="teacher-class__attendance" aria-labelledby="class-recent-title">
                    <h2 id="class-recent-title">최근 출석</h2>
                    <table>
                        <thead>
                        <tr>
                            <th scope="col">날짜</th>
                            <th scope="col">수업</th>
                            <th scope="col">상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        {RECENT_ATTENDANCE.map((item) => (
                            <tr key={item.date}>
                                <td>{item.date}</td>
                                <td>{CLASS_TITLE}</td>
                                <td><Condition status={item.status} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>

                <section className="teacher-class__notices" aria-labelledby="class-notices-title">
                    <div className="teacher-class__notice-toolbar">
                        <h2 id="class-notices-title">공지</h2>
                        <Button text="+ 공지하기" width={170} onClick={onCreate} />
                    </div>
                    <div className="teacher-class__notice-list">
                        {notices.slice(0, 2).map((notice) => (
                            <article key={notice.id} className="teacher-class__notice">
                                <p className="teacher-class__notice-meta">{notice.author} · {notice.date}</p>
                                <h3>{notice.title}</h3>
                                <p className="teacher-class__notice-content">{notice.content.split('\n', 2).join(' ')}</p>
                            </article>
                        ))}
                        {notices.length === 0 && (
                            <p className="notices-empty">등록된 공지가 없습니다.</p>
                        )}
                        <button
                            type="button"
                            className="teacher-class__notice-open"
                            aria-label="공지 목록 열기"
                            onClick={onList}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function Class({ classHref, onReload }) {
    const [notices, setNotices] = useState(readNotices);
    const [view, setView] = useState({ type: 'home' });
    const selectedNotice = notices.find((notice) => notice.id === view.noticeId);
    const bodyView = view.type === 'delete' ? 'detail' : view.type;

    useEffect(() => {
        try {
            sessionStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(notices));
        } catch {
            // Keep the current in-memory notices if browser storage is unavailable.
        }
    }, [notices]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [bodyView]);

    function showList() {
        setView({ type: 'list' });
    }

    function showDetail(noticeId) {
        setView({ type: 'detail', noticeId });
    }

    function createNotice({ title, content }) {
        const notice = {
            id: crypto.randomUUID(),
            author: NOTICE_AUTHOR,
            date: NOTICE_DATE_FORMAT.format(new Date()).replace(/\.$/, ''),
            title,
            content,
        };

        setNotices((previous) => [notice, ...previous]);
        showList();
    }

    function editNotice(fields) {
        setNotices((previous) => previous.map((notice) => (
            notice.id === view.noticeId ? { ...notice, ...fields } : notice
        )));
        showList();
    }

    function deleteNotice() {
        setNotices((previous) => previous.filter((notice) => notice.id !== view.noticeId));
        showList();
    }

    let body;
    if (view.type === 'home') {
        body = (
            <ClassHome
                notices={notices}
                onCreate={() => setView({ type: 'create', from: 'home' })}
                onList={showList}
            />
        );
    } else if (view.type === 'create') {
        body = (
            <NoticesEditor
                mode="create"
                onCancel={() => setView({ type: view.from })}
                onSave={createNotice}
            />
        );
    } else if (view.type === 'edit' && selectedNotice) {
        body = (
            <NoticesEditor
                mode="edit"
                notice={selectedNotice}
                onCancel={() => showDetail(view.noticeId)}
                onSave={editNotice}
            />
        );
    } else if (selectedNotice) {
        body = (
            <Notices
                notice={selectedNotice}
                isConfirmingDelete={view.type === 'delete'}
                onEdit={() => setView({ type: 'edit', noticeId: view.noticeId })}
                onRequestDelete={() => setView({ type: 'delete', noticeId: view.noticeId })}
                onCancelDelete={() => showDetail(view.noticeId)}
                onConfirmDelete={deleteNotice}
            />
        );
    } else {
        body = (
            <NoticesList
                notices={notices}
                onCreate={() => setView({ type: 'create', from: 'list' })}
                onOpen={showDetail}
            />
        );
    }

    return (
        <div className="teacher-class">
            <main className="teacher-class__main">
                <nav className="teacher-class__breadcrumb" aria-label="현재 위치">
                    <ol>
                        <li><a href="#">홈</a></li>
                        <li>
                            <a href={classHref} onClick={onReload}>
                                {CLASS_TITLE}
                            </a>
                        </li>
                        <li aria-current="page">{VIEW_LABELS[view.type]}</li>
                    </ol>
                </nav>

                <h1 className="teacher-class__title">{CLASS_TITLE}</h1>
                <SubNav defaultKey="main" />

                {body}
            </main>
        </div>
    );
}
