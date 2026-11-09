import Header from '../../../components/Header/Header.jsx';
import SubNav from '../../../components/SubNav/SubNav.jsx';
import Calendar from '../../../components/Calendar/Calendar.jsx';
import Condition from '../../../components/Condition/Condition.jsx';
import Button from '../../../components/Button/Button.jsx';
import './Class.css';

const RECENT_ATTENDANCE = [
    { date: '8월 27일', status: '출석' },
    { date: '8월 25일', status: '결석' },
    { date: '8월 20일', status: '보강' },
];

const NOTICES = [
    {
        id: 'presentation',
        date: '2026. 08. 20',
        title: '(역량 수행평가안내) 자기성장보고서 & 북 프리젠테이션',
        content: '재학생을 대상으로 특강을 할 학생 전문가를 모집합니다. 신청 링크에서 신청서를 작성해주세요.',
    },
    {
        id: 'semester',
        date: '2026. 08. 18',
        title: '2학기 수업 일정 안내',
        content: '이번 달 수업 및 보강 일정을 안내합니다.',
    },
];

const CLASS_TITLE = '영어1';

function reloadClass(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    window.location.reload();
}

export default function Class() {
    return (
        <div className="teacher-class">
            <Header />
            <main className="teacher-class__main">
                <nav className="teacher-class__breadcrumb" aria-label="현재 위치">
                    <ol>
                        <li><a href="#">홈</a></li>
                        <li>
                            <a href={window.location.href} onClick={reloadClass}>
                                {CLASS_TITLE}
                            </a>
                        </li>
                        <li aria-current="page">수업 홈</li>
                    </ol>
                </nav>

                <h1 className="teacher-class__title">{CLASS_TITLE}</h1>
                <SubNav defaultKey="main" />

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
                                <Button text="+ 공지하기" color="blue" width={170} />
                            </div>
                            <div className="teacher-class__notice-list">
                                {NOTICES.map((notice) => (
                                    <article key={notice.id} className="teacher-class__notice">
                                        <p className="teacher-class__notice-meta">선생님 · {notice.date}</p>
                                        <h3>{notice.title}</h3>
                                        <p className="teacher-class__notice-content">{notice.content}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
