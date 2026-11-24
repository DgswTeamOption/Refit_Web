import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Overview.css';
import Calendar from '../../../components/Calendar/Calendar';
import ClassBlock from '../../../components/ClassBlock/ClassBlock';
import Button from '../../../components/Button/Button';
import JoinClassModal from './components/JoinClassModal';
import LeaveClassModal from './components/LeaveClassModal';
import studentApi from '../../../api/studentApi';
import { extractIsoDate } from '../Class/constants';

const CLASS_COLORS = ['peach', 'lavender', 'yellow', 'mint'];

// 서버에서 받은 수업 데이터를 화면 카드용 객체로 변환
function formatClassItem(item, index = 0) {
    return {
        id: item.id ?? item.classroomId,
        title: item.name || item.title || '수업',
        classCode: item.classCode || '',
        teacherName: item.teacherName || '',
        bannerImageUrl: item.bannerImageUrl || '',
        color: item.color || CLASS_COLORS[index % CLASS_COLORS.length],
    };
}

// 수업 캘린더 응답에서 해당 연·월의 일자(day) 목록 추출
function extractCalendarDays(calendarResponse, targetYear, targetMonth) {
    const items = Array.isArray(calendarResponse)
        ? calendarResponse
        : Array.isArray(calendarResponse?.events)
            ? calendarResponse.events
            : Array.isArray(calendarResponse?.dates)
                ? calendarResponse.dates
                : Array.isArray(calendarResponse?.schedules)
                    ? calendarResponse.schedules
                    : [];

    const days = [];
    items.forEach((entry) => {
        const raw = typeof entry === 'string'
            ? entry
            : entry?.date || entry?.class_date || entry?.schedule_date || entry?.start_time;
        const iso = extractIsoDate(raw);
        if (!iso) return;

        const [y, m, d] = iso.split('-').map(Number);
        if (y === targetYear && m === targetMonth && d) {
            days.push(d);
        }
    });
    return days;
}

function Overview({ onSelectClass }) {
    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 달력 연·월 및 실제 수업 일정 맵 ({ [day]: ['peach', 'lavender', ...] })
    const [calendarDate, setCalendarDate] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1 };
    });
    const [calendarEvents, setCalendarEvents] = useState({});

    // 모달 및 입력 상태
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [targetClass, setTargetClass] = useState(null);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState(false);
    const [joinErrorMessage, setJoinErrorMessage] = useState('존재하지 않는 코드입니다.');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 처음 화면에 들어올 때 내 수업 목록 불러오기
    useEffect(() => {
        let isMounted = true;

        async function fetchMyClasses() {
            setIsLoading(true);
            try {
                const data = await studentApi.getMyClasses();
                if (!isMounted) return;

                const list = Array.isArray(data) ? data : [];
                setClasses(list.map((item, idx) => formatClassItem(item, idx)));
            } catch {
                if (isMounted) setClasses([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchMyClasses();
        return () => {
            isMounted = false;
        };
    }, []);

    // 참여 중인 수업의 월별 캘린더 일정 불러오기
    useEffect(() => {
        if (classes.length === 0) return;

        let isMounted = true;
        const { year, month } = calendarDate;

        async function fetchAllClassCalendars() {
            const results = await Promise.all(
                classes.map((cls) =>
                    studentApi
                        .getClassCalendar(cls.id, { year, month })
                        .then((data) => ({ color: cls.color, data }))
                        .catch(() => ({ color: cls.color, data: null }))
                )
            );

            if (!isMounted) return;

            const eventsMap = {};
            results.forEach(({ color, data }) => {
                if (!data) return;
                const days = extractCalendarDays(data, year, month);
                days.forEach((day) => {
                    if (!eventsMap[day]) {
                        eventsMap[day] = [];
                    }
                    if (!eventsMap[day].includes(color)) {
                        eventsMap[day].push(color);
                    }
                });
            });

            setCalendarEvents(eventsMap);
        }

        fetchAllClassCalendars();
        return () => {
            isMounted = false;
        };
    }, [classes, calendarDate]);

    const handleMonthChange = (nextYear, nextMonth) => {
        setCalendarDate({ year: nextYear, month: nextMonth });
    };

    // 수업 참여 모달 열기
    const handleOpenJoinModal = () => {
        setJoinCode('');
        setJoinError(false);
        setJoinErrorMessage('존재하지 않는 코드입니다.');
        setIsJoinModalOpen(true);
    };

    // 수업 코드로 참여하기
    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        const trimmed = joinCode.trim();

        if (!trimmed) {
            setJoinError(true);
            setJoinErrorMessage('수업코드를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        setJoinError(false);

        try {
            const joined = await studentApi.joinClass(trimmed);
            setClasses((prev) => [...prev, formatClassItem(joined, prev.length)]);
            setIsJoinModalOpen(false);
        } catch (err) {
            setJoinError(true);
            setJoinErrorMessage(err?.message || '존재하지 않는 코드입니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 수업 나가기 모달 열기
    const handleOpenLeaveModal = (classItem) => {
        setTargetClass(classItem);
        setIsLeaveModalOpen(true);
    };

    // 수업 나가기 확정
    const handleConfirmLeave = async () => {
        if (!targetClass) return;

        setIsSubmitting(true);
        try {
            await studentApi.leaveClass(targetClass.id);
            setClasses((prev) => prev.filter((item) => item.id !== targetClass.id));
            setIsLeaveModalOpen(false);
            setTargetClass(null);
        } catch (err) {
            alert(err?.message || '수업 나가기에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 수업 카드 클릭 시 상세 페이지로 이동
    const handleCardClick = (cls) => {
        if (onSelectClass) {
            onSelectClass(cls);
        }
        navigate(`/class/${cls.id}`, { state: { classInfo: cls } });
    };

    return (
        <div className="student-overview-page">
            <div className="overview-container">
                {/* 좌측 캘린더 영역 */}
                <aside className="overview-calendar-aside">
                    <Calendar
                        highlightToday
                        mode="class"
                        classes={classes}
                        events={classes.length === 0 ? {} : calendarEvents}
                        year={calendarDate.year}
                        month={calendarDate.month}
                        onMonthChange={handleMonthChange}
                    />
                </aside>

                {/* 우측 내 수업 영역 */}
                <section className="overview-content-section">
                    <div className="overview-section-header">
                        <h2 className="overview-section-title">내 수업</h2>
                        <Button
                            text="+ 수업 참여하기"
                            color="blue"
                            width={130}
                            onClick={handleOpenJoinModal}
                        />
                    </div>

                    {isLoading ? (
                        <div className="overview-empty-card">
                            <p className="overview-empty-text">수업 목록을 불러오는 중...</p>
                        </div>
                    ) : classes.length > 0 ? (
                        <div className="overview-class-grid">
                            {classes.map((cls) => (
                                <div
                                    key={cls.id}
                                    className="overview-class-card-wrapper"
                                    onClick={() => handleCardClick(cls)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCardClick(cls);
                                    }}
                                >
                                    <ClassBlock
                                        title={cls.title}
                                        color={cls.color}
                                        bannerImageUrl={cls.bannerImageUrl}
                                        onLeave={(e) => {
                                            e.stopPropagation();
                                            handleOpenLeaveModal(cls);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overview-empty-card">
                            <p className="overview-empty-text">아직 참여한 수업이 없어요</p>
                            <Button
                                text="수업 참여하기"
                                color="blue"
                                width={130}
                                onClick={handleOpenJoinModal}
                            />
                        </div>
                    )}
                </section>
            </div>

            {/* 수업 참여하기 모달 */}
            <JoinClassModal
                isOpen={isJoinModalOpen}
                joinCode={joinCode}
                joinError={joinError}
                errorMessage={joinErrorMessage}
                isSubmitting={isSubmitting}
                onChangeCode={(value) => {
                    setJoinCode(value);
                    setJoinError(false);
                }}
                onSubmit={handleJoinSubmit}
                onClose={() => setIsJoinModalOpen(false)}
            />

            {/* 수업 나가기 모달 */}
            <LeaveClassModal
                isOpen={isLeaveModalOpen}
                onConfirm={handleConfirmLeave}
                onClose={() => setIsLeaveModalOpen(false)}
            />
        </div>
    );
}

export default Overview;
