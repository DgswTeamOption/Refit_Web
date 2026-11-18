import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Class.css';
import Calendar from '../../../components/Calendar/Calendar';
import SubNav from '../../../components/SubNav/SubNav';
import Nav from '../../../components/Nav/Nav';
import studentApi from '../../../api/studentApi';
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

    // 이전 화면에서 넘겨준 수업 정보가 있으면 바로 사용
    const initialClassInfo = propClassInfo || location.state?.classInfo;
    const fallbackTitle = initialClassInfo?.title || CLASS_TITLES[classId] || '영어1';
    const [classTitle, setClassTitle] = useState(fallbackTitle);

    // 현재 선택된 탭 ('main' | 'absence' | 'makeup') 및 서브 화면
    const [activeTab, setActiveTab] = useState('main');
    const [subView, setSubView] = useState('tab');

    // 공지, 출석, 결석, 보강 데이터 상태
    const [notices, setNotices] = useState(NOTICES_DATA);
    const [selectedNotice, setSelectedNotice] = useState(NOTICES_DATA[0]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [absenceList, setAbsenceList] = useState(INITIAL_ABSENCE_LIST);
    const [makeupList, setMakeupList] = useState(INITIAL_MAKEUP_LIST);
    const [availableMakeupSlots, setAvailableMakeupSlots] = useState([]);

    const numericClassId = Number(classId);
    const isValidClassId = Number.isInteger(numericClassId) && numericClassId > 0;

    // 수업 상세 정보 및 목록 데이터 불러오기
    useEffect(() => {
        if (!isValidClassId) return;

        let isMounted = true;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        async function fetchClassData() {
            // 실패한 요청만 null로 처리해 나머지 데이터가 정상 표시되도록 함
            const [
                detail,
                noticesData,
                attendanceData,
                statsData,
                absencesData,
                makeupsData,
                availabilityData,
            ] = await Promise.all([
                studentApi.getClassDetail(numericClassId, { year, month }).catch(() => null),
                studentApi.getNotices(numericClassId).catch(() => null),
                studentApi.getMyAttendance(numericClassId, { year, month }).catch(() => null),
                studentApi.getAttendanceStats(numericClassId, { year, month }).catch(() => null),
                studentApi.getMyAbsences(numericClassId).catch(() => null),
                studentApi.getMakeups(numericClassId).catch(() => null),
                studentApi.getMakeupAvailability({ class_id: numericClassId }).catch(() => null),
            ]);

            if (!isMounted) return;

            const currentTitle = detail?.name || fallbackTitle;
            if (detail?.name) {
                setClassTitle(detail.name);
            }

            if (Array.isArray(noticesData)) {
                const mapped = noticesData.map(mapNoticeFromApi);
                if (mapped.length > 0) {
                    setNotices(mapped);
                    setSelectedNotice(mapped[0]);
                }
            }

            if (Array.isArray(attendanceData)) {
                setAttendanceList(
                    attendanceData.map((item) => mapAttendanceFromApi(item, currentTitle))
                );
            }

            if (Array.isArray(statsData) && statsData[0]) {
                const stat = statsData[0];
                const presentCount = (stat.present_count ?? 0) + (stat.late_count ?? 0);
                const absentCount = stat.absent_count ?? 0;
                setAttendanceStats({
                    presentCount,
                    absentCount,
                    totalCount: presentCount + absentCount,
                });
            }

            if (Array.isArray(absencesData)) {
                setAbsenceList(absencesData.map(mapAbsenceFromApi));
            }

            if (Array.isArray(makeupsData)) {
                setMakeupList(makeupsData.map(mapMakeupFromApi));
            }

            if (Array.isArray(availabilityData)) {
                setAvailableMakeupSlots(availabilityData);
            }
        }

        fetchClassData();
        return () => {
            isMounted = false;
        };
    }, [isValidClassId, numericClassId, fallbackTitle]);

    // 화면 전환 시 항상 최상단으로 스크롤 이동
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [subView, activeTab]);

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
            setAbsenceList((prev) => [mapAbsenceFromApi(created), ...prev]);
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
            const mapped = mapMakeupFromApi(created);
            setMakeupList((prev) => [
                { ...mapped, time: newMakeup.time, reason: newMakeup.reason },
                ...prev,
            ]);
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
                        onSubmit={handleSubmitAbsence}
                        onCancel={handleCancelAbsence}
                    />
                )}

                {subView === 'makeup-apply' && (
                    <MakeupApply
                        items={makeupList}
                        availableSlots={availableMakeupSlots}
                        isServerMode={isValidClassId}
                        onSubmit={handleSubmitMakeup}
                        onCancel={handleCancelMakeup}
                    />
                )}

                {/* 5. 기본 탭 화면 (좌측 달력 + 우측 탭 콘텐츠) */}
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
