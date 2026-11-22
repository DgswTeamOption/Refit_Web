import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Class.css';
import Calendar from '../../../components/Calendar/Calendar';
import SubNav from '../../../components/SubNav/SubNav';
import Nav from '../../../components/Nav/Nav';
import studentApi from '../../../api/studentApi';
import {
    CLASS_TABS,
    mapNoticeFromApi,
    mapAttendanceFromApi,
    mapAbsenceFromApi,
    mapMakeupFromApi,
    buildAttendanceCalendarEvents,
} from './constants';
import ClassMain from './components/ClassMain';
import NoticeList from './components/NoticeList';
import NoticeDetail from './components/NoticeDetail';
import AbsenceList from './components/AbsenceList';
import MakeupList from './components/MakeupList';
import AbsenceApply from './components/AbsenceApply';
import MakeupApply from './components/MakeupApply';

function Class({ classInfo: propClassInfo, onGoHome }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { classId } = useParams();

    // 이전 화면에서 넘겨준 수업 정보가 있으면 바로 사용
    const initialClassInfo = propClassInfo || location.state?.classInfo;
    const fallbackTitle = initialClassInfo?.title || '수업';
    const [classTitle, setClassTitle] = useState(fallbackTitle);

    // 현재 선택된 탭 ('main' | 'absence' | 'makeup') 및 서브 화면
    const [activeTab, setActiveTab] = useState('main');
    const [subView, setSubView] = useState('tab');

    // 달력에 표시 중인 연·월 (1-indexed month)
    const [calendarDate, setCalendarDate] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1 };
    });

    // 공지, 출석, 캘린더, 결석, 보강 데이터 상태 (목업 없이 빈 상태로 초기화)
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [calendarData, setCalendarData] = useState([]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [absenceList, setAbsenceList] = useState([]);
    const [makeupList, setMakeupList] = useState([]);
    const [availableMakeupSlots, setAvailableMakeupSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const numericClassId = Number(classId);
    const isValidClassId = Number.isInteger(numericClassId) && numericClassId > 0;

    // 1. 수업 기본 목록 데이터 불러오기 (공지, 결석, 보강, 보강 가능 시간)
    useEffect(() => {
        if (!isValidClassId) return;

        let isMounted = true;

        async function fetchStaticClassData() {
            const [noticesData, absencesData, makeupsData, availabilityData] = await Promise.all([
                studentApi.getNotices(numericClassId).catch(() => null),
                studentApi.getMyAbsences(numericClassId).catch(() => null),
                studentApi.getMakeups(numericClassId).catch(() => null),
                studentApi.getMakeupAvailability({ class_id: numericClassId }).catch(() => null),
            ]);

            if (!isMounted) return;

            if (Array.isArray(noticesData)) {
                const mapped = noticesData.map(mapNoticeFromApi);
                setNotices(mapped);
                setSelectedNotice(mapped[0] || null);
            }

            if (Array.isArray(absencesData)) {
                setAbsenceList(absencesData.map((item) => mapAbsenceFromApi(item)));
            }

            if (Array.isArray(makeupsData)) {
                setMakeupList(makeupsData.map((item) => mapMakeupFromApi(item)));
            }

            if (Array.isArray(availabilityData)) {
                setAvailableMakeupSlots(availabilityData);
            }
        }

        fetchStaticClassData();
        return () => {
            isMounted = false;
        };
    }, [isValidClassId, numericClassId]);

    // 2. 월별 데이터 불러오기 (수업 상세, 캘린더, 해당 월 출석 및 통계)
    useEffect(() => {
        if (!isValidClassId) return;

        let isMounted = true;
        const { year, month } = calendarDate;

        async function fetchMonthlyData() {
            setIsLoading(true);
            const [detail, monthlyCalendar, attendanceData, statsData] = await Promise.all([
                studentApi.getClassDetail(numericClassId, { year, month }).catch(() => null),
                studentApi.getClassCalendar(numericClassId, { year, month }).catch(() => null),
                studentApi.getMyAttendance(numericClassId, { year, month }).catch(() => null),
                studentApi.getAttendanceStats(numericClassId, { year, month }).catch(() => null),
            ]);

            if (!isMounted) return;

            const currentTitle = detail?.name || fallbackTitle;
            if (detail?.name) {
                setClassTitle(detail.name);
            }

            setCalendarData(monthlyCalendar || []);

            if (Array.isArray(attendanceData)) {
                setAttendanceList(
                    attendanceData.map((item) => mapAttendanceFromApi(item, currentTitle))
                );
            } else {
                setAttendanceList([]);
            }

            const stat = Array.isArray(statsData) ? statsData[0] : statsData;
            if (stat && typeof stat === 'object') {
                const presentCount = (stat.present_count ?? 0) + (stat.late_count ?? 0);
                const absentCount = stat.absent_count ?? 0;
                setAttendanceStats({
                    presentCount,
                    absentCount,
                    totalCount: stat.total_count ?? (presentCount + absentCount),
                });
            } else {
                setAttendanceStats(null);
            }

            setIsLoading(false);
        }

        fetchMonthlyData();
        return () => {
            isMounted = false;
        };
    }, [isValidClassId, numericClassId, calendarDate, fallbackTitle]);

    // 화면 전환 시 항상 최상단으로 스크롤 이동
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [subView, activeTab]);

    const handleMonthChange = (nextYear, nextMonth) => {
        setCalendarDate({ year: nextYear, month: nextMonth });
    };

    const handleGoHome = () => {
        if (onGoHome) {
            onGoHome();
        } else {
            navigate('/student');
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSubView('tab');
    };

    const handleBreadcrumbClassClick = () => {
        setActiveTab('main');
        setSubView('tab');
    };

    // 공지 상세 보기
    const handleOpenNoticeDetail = async (notice) => {
        setSelectedNotice(notice);
        setSubView('notice-detail');

        if (isValidClassId && notice?.id) {
            try {
                const detail = await studentApi.getNoticeDetail(numericClassId, notice.id);
                if (detail) {
                    setSelectedNotice(mapNoticeFromApi(detail));
                }
            } catch {
                // 상세 조회 실패 시 기존 목록 데이터 유지
            }
        }
    };

    // 결석 신청하기 (실패 시 로컬 상태 변경 없이 에러 전달)
    const handleSubmitAbsence = async (newAbsence) => {
        if (isValidClassId) {
            const created = await studentApi.requestAbsence(numericClassId, {
                reason: newAbsence.reason,
                absence_date: newAbsence.rawDate,
            });
            setAbsenceList((prev) => [mapAbsenceFromApi(created, newAbsence), ...prev]);
            setSubView('tab');
            return;
        }
        setAbsenceList((prev) => [newAbsence, ...prev]);
        setSubView('tab');
    };

    // 보강 신청하기 (실패 시 로컬 상태 변경 없이 에러 전달)
    const handleSubmitMakeup = async (newMakeup) => {
        if (isValidClassId) {
            const created = await studentApi.requestMakeup({
                class_id: numericClassId,
                schedule_id: newMakeup.scheduleId,
                makeup_time: newMakeup.isoMakeupTime,
            });
            setMakeupList((prev) => [mapMakeupFromApi(created, newMakeup), ...prev]);
            setSubView('tab');
            return;
        }
        setMakeupList((prev) => [newMakeup, ...prev]);
        setSubView('tab');
    };

    // 결석 취소하기 (실패 시 목록 유지 및 오류 안내)
    const handleCancelAbsence = async (id) => {
        if (isValidClassId) {
            try {
                await studentApi.cancelAbsence(id);
            } catch (err) {
                alert(err?.message || '결석 신청 취소에 실패했습니다.');
                return;
            }
        }
        setAbsenceList((prev) => prev.filter((item) => item.id !== id));
    };

    // 보강 취소하기 (실패 시 목록 유지 및 오류 안내)
    const handleCancelMakeup = async (id) => {
        if (isValidClassId) {
            try {
                await studentApi.cancelMakeup(id);
            } catch (err) {
                alert(err?.message || '보강 신청 취소에 실패했습니다.');
                return;
            }
        }
        setMakeupList((prev) => prev.filter((item) => item.id !== id));
    };

    // 현재 보고 있는 월의 실제 달력 이벤트 계산
    const calendarEvents = buildAttendanceCalendarEvents({
        year: calendarDate.year,
        month: calendarDate.month,
        calendarData,
        attendanceList,
        absenceList,
        makeupList,
    });

    // 현재 위치(Breadcrumb) 마지막 글자 결정
    const getBreadcrumbLastText = () => {
        if (subView === 'notice-list') return '공지 목록';
        if (subView === 'notice-detail') return '수업 공지';
        if (subView === 'absence-apply') return '결석 신청';
        if (subView === 'makeup-apply') return '보강 신청';
        if (activeTab === 'absence') return '결석 일정';
        if (activeTab === 'makeup') return '보강 일정';
        return '수업 홈';
    };

    return (
        <div className="class-page">
            <div className="class-container">
                {/* 1. 현재 위치 네비게이션 */}
                <Nav
                    label="현재 위치"
                    items={[
                        { text: '홈', onClick: handleGoHome },
                        { text: classTitle, onClick: handleBreadcrumbClassClick },
                        { text: getBreadcrumbLastText() },
                    ]}
                />

                {/* 2. 수업 제목 */}
                <h1 className="class-title">{classTitle}</h1>

                {/* 3. 상단 탭 바 */}
                <div className="class-subnav-wrapper">
                    <SubNav
                        role="student"
                        customTabs={CLASS_TABS}
                        defaultKey={activeTab}
                        onChange={handleTabChange}
                    />
                </div>

                {/* 4. 서브 화면 (공지 목록/상세, 결석/보강 신청) */}
                {subView === 'notice-list' && (
                    <NoticeList
                        notices={notices}
                        onSelectNotice={handleOpenNoticeDetail}
                    />
                )}

                {subView === 'notice-detail' && (
                    <NoticeDetail
                        notice={selectedNotice}
                        onBack={() => setSubView('notice-list')}
                    />
                )}

                {subView === 'absence-apply' && (
                    <AbsenceApply
                        items={absenceList}
                        calendarEvents={calendarEvents}
                        calendarYear={calendarDate.year}
                        calendarMonth={calendarDate.month}
                        onMonthChange={handleMonthChange}
                        onSubmit={handleSubmitAbsence}
                        onCancel={handleCancelAbsence}
                    />
                )}

                {subView === 'makeup-apply' && (
                    <MakeupApply
                        items={makeupList}
                        availableSlots={availableMakeupSlots}
                        isServerMode={isValidClassId}
                        calendarEvents={calendarEvents}
                        calendarYear={calendarDate.year}
                        calendarMonth={calendarDate.month}
                        onMonthChange={handleMonthChange}
                        onSubmit={handleSubmitMakeup}
                        onCancel={handleCancelMakeup}
                    />
                )}

                {/* 5. 기본 탭 화면 (좌측 달력 + 우측 탭 콘텐츠) */}
                {subView === 'tab' && (
                    <div className="class-two-columns">
                        <aside className="class-calendar-aside">
                            <Calendar
                                highlightToday
                                mode="attendance"
                                events={calendarEvents}
                                year={calendarDate.year}
                                month={calendarDate.month}
                                onMonthChange={handleMonthChange}
                            />
                        </aside>

                        <section className="class-content-area">
                            {activeTab === 'main' && (
                                <ClassMain
                                    title={classTitle}
                                    attendanceList={attendanceList}
                                    attendanceStats={attendanceStats}
                                    notices={notices}
                                    isLoading={isLoading}
                                    onViewMoreNotices={() => setSubView('notice-list')}
                                    onSelectNotice={handleOpenNoticeDetail}
                                />
                            )}

                            {activeTab === 'absence' && (
                                <AbsenceList
                                    items={absenceList}
                                    onOpenApply={() => setSubView('absence-apply')}
                                    onCancel={handleCancelAbsence}
                                />
                            )}

                            {activeTab === 'makeup' && (
                                <MakeupList
                                    items={makeupList}
                                    onOpenApply={() => setSubView('makeup-apply')}
                                    onCancel={handleCancelMakeup}
                                />
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Class;
