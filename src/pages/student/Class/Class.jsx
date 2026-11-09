import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Class.css';
import Calendar from '../../../components/Calendar/Calendar';
import SubNav from '../../../components/SubNav/SubNav';
import {
    CLASS_TABS,
    CLASS_TITLES,
    NOTICES_DATA,
    INITIAL_ABSENCE_LIST,
    INITIAL_MAKEUP_LIST,
} from './constants';
import ClassMain from './components/ClassMain';
import NoticeList from './components/NoticeList';
import NoticeDetail from './components/NoticeDetail';
import AbsenceList from './components/AbsenceList';
import MakeupList from './components/MakeupList';
import AbsenceApply from './components/AbsenceApply';
import MakeupApply from './components/MakeupApply';

function Class({ classInfo, onGoHome }) {
    const navigate = useNavigate();
    const { classId } = useParams();

    const title = classInfo?.title || CLASS_TITLES[classId] || '영어1';

    // 활성 탭: 'main' | 'absence' | 'makeup'
    const [activeTab, setActiveTab] = useState('main');

    // 서브 화면: 'tab' | 'absence-apply' | 'makeup-apply' | 'notice-list' | 'notice-detail'
    const [subView, setSubView] = useState('tab');
    const [selectedNotice, setSelectedNotice] = useState(NOTICES_DATA[0]);

    // 결석 및 보강 신청 내역 상태
    const [absenceList, setAbsenceList] = useState(INITIAL_ABSENCE_LIST);
    const [makeupList, setMakeupList] = useState(INITIAL_MAKEUP_LIST);

    // 뷰나 탭이 전환되면 항상 화면 최상단으로 스크롤 이동
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [subView, activeTab]);

    const handleGoHome = () => {
        if (onGoHome) {
            onGoHome();
        } else {
            navigate('/');
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSubView('tab');
    };

    const handleOpenNoticeDetail = (notice) => {
        setSelectedNotice(notice);
        setSubView('notice-detail');
    };

    // 신청 핸들러
    const handleSubmitAbsence = (newAbsence) => {
        setAbsenceList((prev) => [newAbsence, ...prev]);
        setSubView('tab');
    };

    const handleSubmitMakeup = (newMakeup) => {
        setMakeupList((prev) => [newMakeup, ...prev]);
        setSubView('tab');
    };

    const handleCancelAbsence = (id) => {
        setAbsenceList((prev) => prev.filter((item) => item.id !== id));
    };

    const handleCancelMakeup = (id) => {
        setMakeupList((prev) => prev.filter((item) => item.id !== id));
    };

    // Breadcrumb 마지막 텍스트 계산
    const getBreadcrumbLastText = () => {
        if (subView === 'notice-list') return '공지 목록';
        if (subView === 'notice-detail') return '수업 공지';
        if (subView === 'absence-apply') return '결석 신청';
        if (subView === 'makeup-apply') return '보강 신청';
        if (activeTab === 'main') return '수업 홈';
        if (activeTab === 'absence') return '결석 일정';
        if (activeTab === 'makeup') return '보강 일정';
        return '수업 홈';
    };

    return (
        <div className="class-page">
            <div className="class-container">
                {/* 1. Breadcrumb 네비게이션 */}
                <nav className="class-breadcrumb" aria-label="breadcrumb">
                    <button type="button" className="breadcrumb-link" onClick={handleGoHome}>
                        홈
                    </button>
                    <span className="breadcrumb-separator">›</span>
                    <button
                        type="button"
                        className="breadcrumb-link"
                        onClick={() => {
                            setActiveTab('main');
                            setSubView('tab');
                        }}
                    >
                        {title}
                    </button>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-current">{getBreadcrumbLastText()}</span>
                </nav>

                {/* 2. 수업 메인 타이틀 */}
                <h1 className="class-title">{title}</h1>

                {/* 3. SubNav 탭 바 */}
                <div className="class-subnav-wrapper">
                    <SubNav
                        customTabs={CLASS_TABS}
                        tabs={CLASS_TABS}
                        defaultKey={activeTab}
                        onChange={handleTabChange}
                    />
                </div>

                {/* 4. 본문 서브 뷰 렌더링 */}
                {subView === 'notice-list' && (
                    <NoticeList
                        notices={NOTICES_DATA}
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

                        <main className="class-content-area">
                            {activeTab === 'main' && (
                                <ClassMain
                                    title={title}
                                    notices={NOTICES_DATA}
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
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Class;
