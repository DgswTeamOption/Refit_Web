import Button from '../../../../components/Button/Button.jsx';
import Condition from '../../../../components/Condition/Condition.jsx';
import { attendanceLabel, attendanceTotals, noticeForView } from '../../teacherViewData.js';
import ClassCalendar from './ClassCalendar.jsx';

function RequestState({ resource, onRetry }) {
    if (resource.loading) return <p role="status">불러오는 중입니다.</p>;
    if (!resource.error) return null;
    return (
        <div role="alert">
            <p>{resource.error}</p>
            <Button text="다시 시도" width={110} onClick={onRetry} />
        </div>
    );
}

export default function ClassHome({ classroom, period, onPeriodChange, summary, attendance, selectedDate, onSelectDate, notices, onRetry, onCreate, onOpen, onList }) {
    const totals = attendanceTotals(summary.data);
    const total = totals.present + totals.late + totals.absent;
    const [, month, day] = selectedDate.split('-');
    const displayDate = Number(month) + '월 ' + Number(day) + '일';
    return (
        <div className="teacher-class__layout">
            <aside className="teacher-class__calendar" aria-label="수업 달력">
                <ClassCalendar period={period} onPeriodChange={onPeriodChange} classroom={classroom} selectedDate={selectedDate} onSelectDate={onSelectDate} />
            </aside>
            <div className="teacher-class__content">
                <section className="teacher-class__summary" aria-labelledby="class-attendance-title">
                    <h2 id="class-attendance-title">이번달 출석 현황</h2>
                    <RequestState resource={summary} onRetry={onRetry} />
                    {!summary.loading && !summary.error && (
                        <div className="teacher-class__totals">
                            <div className="teacher-class__total teacher-class__total--attendance"><Condition status="출석" /><span>{totals.present}/{total}</span></div>
                            <div className="teacher-class__total teacher-class__total--absence"><Condition status="결석" /><span>{totals.absent}</span></div>
                        </div>
                    )}
                </section>
                <section className="teacher-class__attendance" aria-labelledby="class-recent-title">
                    <h2 id="class-recent-title">최근 출석</h2>
                    <RequestState resource={attendance} onRetry={onRetry} />
                    {!attendance.loading && !attendance.error && (
                        <table>
                            <thead><tr><th scope="col">날짜</th><th scope="col">수업</th><th scope="col">상태</th></tr></thead>
                            <tbody>
                                {attendance.data.map((item) => (
                                    <tr key={item.schedule_id + '-' + item.student_id}>
                                        <td>{displayDate}</td><td>{classroom.name}</td><td>{['PRESENT', 'ABSENT'].includes(item.status) ? <Condition status={attendanceLabel(item.status)} /> : attendanceLabel(item.status)}</td>
                                    </tr>
                                ))}
                                {!attendance.data.length && <tr><td colSpan={3}>이 날짜의 출석 내역이 없습니다.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </section>
                <section className="teacher-class__notices" aria-labelledby="class-notices-title">
                    <div className="teacher-class__notice-toolbar">
                        <h2 id="class-notices-title">공지</h2>
                        <Button text="+ 공지하기" width={170} onClick={onCreate} />
                    </div>
                    <RequestState resource={notices} onRetry={onRetry} />
                    {!notices.loading && !notices.error && (
                        <div className="teacher-class__notice-list">
                            {notices.data.slice(0, 2).map((item) => {
                                const notice = noticeForView(item, classroom.teacherName);
                                return (
                                    <article key={notice.id} className="teacher-class__notice">
                                        <p className="teacher-class__notice-meta">{notice.author} · {notice.date}</p>
                                        <h3>{notice.title}</h3>
                                        <p className="teacher-class__notice-content">{notice.content.split('\n', 2).join(' ')}</p>
                                        <button type="button" className="teacher-class__notice-open" aria-label={notice.title + ' 공지 보기'} onClick={() => onOpen(notice.id)} />
                                    </article>
                                );
                            })}
                            {!notices.data.length && <p className="notices-empty">등록된 공지가 없습니다.</p>}
                        </div>
                    )}
                    <button type="button" className="notices-link teacher-class__notice-more" onClick={onList}>더보기</button>
                </section>
            </div>
        </div>
    );
}
