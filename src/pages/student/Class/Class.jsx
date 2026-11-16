import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Class.css';
import Calendar from '../../../components/Calendar/Calendar';
import SubNav from '../../../components/SubNav/SubNav';
import studentApi from '../../../api/studentApi';
import Nav from '../../../components/Nav/Nav';
import {
    CLASS_TABS,
    CLASS_TITLES,
    NOTICES_DATA,
    INITIAL_ABSENCE_LIST,
    INITIAL_MAKEUP_LIST,
    mapNoticeFromApi,
    mapAttendanceFromApi,
    mapAbsenceFromApi,
    mapMakeupFromApi,
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

    const initialClassInfo = propClassInfo || location.state?.classInfo;
    const fallbackTitle = initialClassInfo?.title || CLASS_TITLES[classId] || '영어1';
    const [classTitle, setClassTitle] = useState(fallbackTitle);

    // 활성 탭: 'main' | 'absence' | 'makeup'
    const [activeTab, setActiveTab] = useState('main');

    // 서브 화면: 'tab' | 'absence-apply' | 'makeup-apply' | 'notice-list' | 'notice-detail'
    const [subView, setSubView] = useState('tab');
    const [notices, setNotices] = useState(NOTICES_DATA);
    const [selectedNotice, setSelectedNotice] = useState(NOTICES_DATA[0]);

    // 출석 현황, 결석 및 보강 신청 내역 상태
    const [attendanceList, setAttendanceList] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [absenceList, setAbsenceList] = useState(INITIAL_ABSENCE_LIST);
    const [makeupList, setMakeupList] = useState(INITIAL_MAKEUP_LIST);
    const [availableMakeupSlots, setAvailableMakeupSlots] = useState([]);

    const numericClassId = useMemo(() => {
        const parsed = Number(classId);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }, [classId]);

    // 서버 데이터 일괄 조회 (숫자 classId일 때 백엔드 API와 동기화)
    useEffect(() => {
        if (!numericClassId) return undefined;

        const controller = new AbortController();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const fetchClassData = async () => {
            const [
                detailRes,
                noticesRes,
                attendanceRes,
                statsRes,
                absencesRes,
                makeupsRes,
                availabilityRes,
            ] = await Promise.allSettled([
                studentApi.getClassDetail(numericClassId, { year, month }, controller.signal),
                studentApi.getNotices(numericClassId, controller.signal),
                studentApi.getMyAttendance(numericClassId, { year, month }, controller.signal),
                studentApi.getAttendanceStats(numericClassId, { year, month }, controller.signal),
                studentApi.getMyAbsences(numericClassId, controller.signal),
                studentApi.getMakeups(numericClassId, undefined, controller.signal),
                studentApi.getMakeupAvailability({ class_id: numericClassId }, controller.signal),
            ]);

            if (controller.signal.aborted) return;

            const resolvedTitle =
                detailRes.status === 'fulfilled' && detailRes.value?.name
                    ? detailRes.value.name
                    : fallbackTitle;

            if (detailRes.status === 'fulfilled' && detailRes.value?.name) {
                setClassTitle(detailRes.value.name);
            }

            if (noticesRes.status === 'fulfilled' && Array.isArray(noticesRes.value)) {
                const mappedNotices = noticesRes.value.map(mapNoticeFromApi);
                if (mappedNotices.length > 0) {
                    setNotices(mappedNotices);
                    setSelectedNotice(mappedNotices[0]);
                }
            }

            if (attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value)) {
                setAttendanceList(
                    attendanceRes.value.map((item) => mapAttendanceFromApi(item, resolvedTitle))
                );
            }

            if (statsRes.status === 'fulfilled' && Array.isArray(statsRes.value) && statsRes.value[0]) {
                const stat = statsRes.value[0];
                const presentCount = (stat.present_count ?? 0) + (stat.late_count ?? 0);
                const absentCount = stat.absent_count ?? 0;
                setAttendanceStats({
                    presentCount,
                    absentCount,
                    totalCount: presentCount + absentCount,
                });
            }

            if (absencesRes.status === 'fulfilled' && Array.isArray(absencesRes.value)) {
                setAbsenceList(absencesRes.value.map(mapAbsenceFromApi));
            }

            if (makeupsRes.status === 'fulfilled' && Array.isArray(makeupsRes.value)) {
                setMakeupList(makeupsRes.value.map(mapMakeupFromApi));
            }

            if (availabilityRes.status === 'fulfilled' && Array.isArray(availabilityRes.value)) {
                setAvailableMakeupSlots(availabilityRes.value);
            }
        };

        fetchClassData();
        return () => controller.abort();
    }, [numericClassId, fallbackTitle]);

    // 뷰나 탭이 전환되면 항상 화면 최상단으로 스크롤 이동
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [subView, activeTab]);

    const handleGoHome = useCallback(() => {
        if (onGoHome) {
            onGoHome();
        } else {
            navigate('/student');
        }
    }, [navigate, onGoHome]);

    const handleTabChange = useCallback((key) => {
        setActiveTab(key);
        setSubView('tab');
    }, []);

    const handleBreadcrumbClassClick = useCallback(() => {
        setActiveTab('main');
        setSubView('tab');
    }, []);

    const handleOpenNoticeDetail = useCallback(async (notice) => {
        setSelectedNotice(notice);
        setSubView('notice-detail');

        if (numericClassId && notice?.id) {
            try {
                const detail = await studentApi.getNoticeDetail(numericClassId, notice.id);
                if (detail) {
                    setSelectedNotice(mapNoticeFromApi(detail));
                }
            } catch {
                // 상세 조회 실패 시 목록에서 전달된 데이터 유지
            }
        }
    }, [numericClassId]);

    // 결석 신청 (POST /api/class/absences/{classId})
    const handleSubmitAbsence = useCallback(async (newAbsence) => {
        if (numericClassId) {
            try {
                const created = await studentApi.requestAbsence(numericClassId, {
                    reason: newAbsence.reason,
                    absence_date: newAbsence.rawDate,
                });
                setAbsenceList((prev) => [mapAbsenceFromApi(created), ...prev]);
                setSubView('tab');
                return;
            } catch {
                // 서버 미연결/오류 시 로컬 상태 반영 Fallback
            }
        }
        setAbsenceList((prev) => [newAbsence, ...prev]);
        setSubView('tab');
    }, [numericClassId]);

    // 보강 신청 (POST /api/makeups/request)
    const handleSubmitMakeup = useCallback(async (newMakeup) => {
        if (numericClassId) {
            try {
                const created = await studentApi.requestMakeup({
                    class_id: numericClassId,
                    schedule_id: newMakeup.scheduleId || 0,
                    makeup_time: newMakeup.isoMakeupTime,
                });
                const mapped = mapMakeupFromApi(created);
                setMakeupList((prev) => [
                    { ...mapped, time: newMakeup.time, reason: newMakeup.reason },
                    ...prev,
                ]);
                setSubView('tab');
                return;
            } catch {
                // 서버 미연결/오류 시 로컬 상태 반영 Fallback
            }
        }
        setMakeupList((prev) => [newMakeup, ...prev]);
        setSubView('tab');
    }, [numericClassId]);

    // 결석 취소 (DELETE /api/class/absences/{absenceId})
    const handleCancelAbsence = useCallback(async (id) => {
        if (numericClassId) {
            try {
                await studentApi.cancelAbsence(id);
            } catch {
                // 서버 미연결 시에도 로컬 목록 갱신
            }
        }
        setAbsenceList((prev) => prev.filter((item) => item.id !== id));
    }, [numericClassId]);

    // 보강 취소 (PATCH /api/makeups/cancel/{makeupId})
    const handleCancelMakeup = useCallback(async (id) => {
        if (numericClassId) {
            try {
                await studentApi.cancelMakeup(id);
            } catch {
                // 서버 미연결 시에도 로컬 목록 갱신
            }
        }
        setMakeupList((prev) => prev.filter((item) => item.id !== id));
    }, [numericClassId]);

    // Breadcrumb 마지막 텍스트 계산
    const breadcrumbLastText = useMemo(() => {
        if (subView === 'notice-list') return '공지 목록';
        if (subView === 'notice-detail') return '수업 공지';
        if (subView === 'absence-apply') return '결석 신청';
        if (subView === 'makeup-apply') return '보강 신청';
        if (activeTab === 'main') return '수업 홈';
        if (activeTab === 'absence') return '결석 일정';
        if (activeTab === 'makeup') return '보강 일정';
        return '수업 홈';
    }, [subView, activeTab]);

    return (
        <div className="class-page">
            <div className="class-container">
                {/* 1. Breadcrumb 네비게이션 */}
                <Nav
                    label="현재 위치"
                    items={[
                        { text: '홈', onClick: handleGoHome },
                        { text: classTitle, onClick: handleBreadcrumbClassClick },
                        { text: breadcrumbLastText },
                    ]}
                />

                {/* 2. 수업 메인 타이틀 */}
                <h1 className="class-title">{classTitle}</h1>

                {/* 3. SubNav 탭 바 */}
                <div className="class-subnav-wrapper">
                    <SubNav
                        role="student"
                        customTabs={CLASS_TABS}
                        defaultKey={activeTab}
                        onChange={handleTabChange}
                    />
                </div>

                {/* 4. 본문 서브 뷰 렌더링 */}
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
                        onSubmit={handleSubmitAbsence}
                        onCancel={handleCancelAbsence}
                    />
                )}

                {subView === 'makeup-apply' && (
                    <MakeupApply
                        items={makeupList}
                        availableSlots={availableMakeupSlots}
                        onSubmit={handleSubmitMakeup}
                        onCancel={handleCancelMakeup}
                    />
                )}

                {/* 5. 기본 탭 화면 (2컬럼: 좌측 캘린더 + 우측 탭별 콘텐츠) */}
                {subView === 'tab' && (
                    <div className="class-two-columns">
                        <aside className="class-calendar-aside">
                            <Calendar mode="attendance" />
                        </aside>

                        <section className="class-content-area">
                            {activeTab === 'main' && (
                                <ClassMain
                                    title={classTitle}
                                    attendanceList={attendanceList}
                                    attendanceStats={attendanceStats}
                                    notices={notices}
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
