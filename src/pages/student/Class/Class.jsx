import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Class.css';
import Calendar from '../../../components/Calendar/Calendar';
import Condition from '../../../components/Condition/Condition';
import Button from '../../../components/Button/Button';
import SubNav from '../../../components/SubNav/SubNav';

const CLASS_TABS = [
    { key: 'main', label: '메인' },
    { key: 'absence', label: '결석 일정' },
    { key: 'makeup', label: '보강 일정' },
];

const NOTICES_DATA = [
    {
        id: 'notice-1',
        author: '선생님',
        date: '2026. 08. 20',
        title: '(역량 수행평가안내) 자기성장보고서 & 북 프리젠테이션',
        excerpt: '재학생을 대상으로 특강을 할 학생 전문가를 모집합니다. 신청 링크에서 신청서를 작성해주세요.',
        content: [
            '재학생을 대상으로 특강을 할 학생 전문가를 모집합니다.',
            '특강을 희망하는 학생은 아래 신청 링크에서 신청서를 작성하면 됩니다.',
            '1. 대상: 재학생 전체',
            '2. 모집 기간: ~ 2026. 9. 11 (금)까지',
            '3. 특강 가능 일시: 설문 참고',
            '4. 특강 시간: 40분 ~ 50분',
            '5. 참여 학생 지원 사항: 필요한 자료 및 도서를 구입할 수 있는 문화상품권 25,000원 증정',
            '신청 링크: https://refit.example/apply',
        ],
    },
    {
        id: 'notice-2',
        author: '선생님',
        date: '2026. 08. 18',
        title: '2학기 수업 일정 안내',
        excerpt: '이번 달 수업 및 보강 일정을 안내합니다.',
        content: [
            '이번 달 수업 및 보강 일정을 안내합니다.',
            '개인 사정으로 인한 결석 시 최소 24시간 전 결석 일정을 등록해 주시기 바랍니다.',
            '보강은 협의 후 일정에 따라 순차 배정됩니다.',
        ],
    },
    {
        id: 'notice-3',
        author: '선생님',
        date: '2026. 08. 15',
        title: '교재 준비 안내',
        excerpt: '다음 수업 전까지 교재를 준비해주세요.',
        content: [
            '다음 수업 전까지 지정 교재(Refit 기본 워크북 2권)를 준비해주세요.',
            '교재 분실 시 담당 교사에게 문의 바랍니다.',
        ],
    },
];

const CLASS_TITLES = {
    eng1: '영어1',
    eng2: '영어2',
    math1: '수학1',
    math2: '수학2',
};

// YYYY-MM-DD -> YYYY년 M월 D일 포맷팅 (년도 포함)
const formatToKoreanDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
        }
    }
    return dateStr;
};

function Class({ classInfo, onGoHome }) {
    const navigate = useNavigate();
    const { classId } = useParams();

    const title = classInfo?.title || CLASS_TITLES[classId] || '영어1';

    // 활성 탭: 'main' | 'absence' | 'makeup'
    const [activeTab, setActiveTab] = useState('main');

    // 서브 화면: 'tab' | 'absence-apply' | 'makeup-apply' | 'notice-list' | 'notice-detail'
    const [subView, setSubView] = useState('tab');
    const [selectedNotice, setSelectedNotice] = useState(NOTICES_DATA[0]);

    // 결석 신청 폼 상태 (view12)
    const [absenceDate, setAbsenceDate] = useState('');
    const [absenceDay, setAbsenceDay] = useState(null);
    const [absenceReason, setAbsenceReason] = useState('');

    // 보강 신청 폼 상태 (view13)
    const [makeupDate, setMakeupDate] = useState('');
    const [makeupDay, setMakeupDay] = useState(null);
    const [makeupStartTime, setMakeupStartTime] = useState('');
    const [makeupEndTime, setMakeupEndTime] = useState('');
    const [makeupReason, setMakeupReason] = useState('');

    // 결석 신청 내역 목업 데이터 (view10, view12 - 년도 표기 포함)
    const [absenceList, setAbsenceList] = useState([
        { id: 1, date: '2026년 8월 27일', reason: '병원 방문', status: '대기중', canCancel: true },
        { id: 2, date: '2026년 8월 20일', reason: '가족 일정', status: '수락됨', canCancel: false },
        { id: 3, date: '2026년 8월 18일', reason: '개인 일정', status: '거절됨', canCancel: false },
    ]);

    // 보강 신청 내역 목업 데이터 (view11, view13 - 년도 표기 포함)
    const [makeupList, setMakeupList] = useState([
        { id: 1, date: '2026년 8월 29일', time: '16:00 ~ 17:00', reason: '병원 방문', status: '대기중', canCancel: true },
        { id: 2, date: '2026년 8월 22일', time: '17:00 ~ 18:00', reason: '가족 일정', status: '수락됨', canCancel: false },
        { id: 3, date: '2026년 8월 15일', time: '15:00 ~ 16:00', reason: '개인 일정', status: '거절됨', canCancel: false },
    ]);

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

    const handleOpenNoticeList = () => {
        setSubView('notice-list');
    };

    const handleOpenNoticeDetail = (notice) => {
        setSelectedNotice(notice);
        setSubView('notice-detail');
    };

    const handleBackToNoticeList = () => {
        setSubView('notice-list');
    };

    // 좌측 캘린더에서 날짜 클릭 시 결석 날짜 자동 선택
    const handleSelectAbsenceDateFromCalendar = (day) => {
        setAbsenceDay(day);
        const dayStr = String(day).padStart(2, '0');
        setAbsenceDate(`2026-08-${dayStr}`);
    };

    // 좌측 캘린더에서 날짜 클릭 시 보강 날짜 자동 선택
    const handleSelectMakeupDateFromCalendar = (day) => {
        setMakeupDay(day);
        const dayStr = String(day).padStart(2, '0');
        setMakeupDate(`2026-08-${dayStr}`);
    };

    // 결석 신청 제출 (view12 - 날짜 필수 검증)
    const handleSubmitAbsence = (e) => {
        e.preventDefault();
        if (!absenceDate || !absenceDate.trim()) {
            return;
        }

        const newAbsence = {
            id: Date.now(),
            date: formatToKoreanDate(absenceDate),
            reason: absenceReason.trim() || '기타 사유',
            status: '대기중',
            canCancel: true,
        };
        setAbsenceList((prev) => [newAbsence, ...prev]);
        setAbsenceDate('');
        setAbsenceDay(null);
        setAbsenceReason('');
        setSubView('tab');
    };

    // 보강 신청 제출 (view13 - 날짜 및 시간 유효성 검증)
    const isTimeInvalid = Boolean(
        makeupStartTime && makeupEndTime && makeupStartTime >= makeupEndTime
    );

    const handleSubmitMakeup = (e) => {
        e.preventDefault();
        if (!makeupDate || !makeupDate.trim() || isTimeInvalid) {
            return;
        }

        const timeStr = makeupStartTime && makeupEndTime
            ? `${makeupStartTime} ~ ${makeupEndTime}`
            : (makeupStartTime || makeupEndTime || '16:00 ~ 17:00');

        const newMakeup = {
            id: Date.now(),
            date: formatToKoreanDate(makeupDate),
            time: timeStr,
            reason: makeupReason.trim() || '기타 사유',
            status: '대기중',
            canCancel: true,
        };
        setMakeupList((prev) => [newMakeup, ...prev]);
        setMakeupDate('');
        setMakeupDay(null);
        setMakeupStartTime('');
        setMakeupEndTime('');
        setMakeupReason('');
        setSubView('tab');
    };

    const handleCancelAbsence = (id) => {
        setAbsenceList((prev) => prev.filter((item) => item.id !== id));
    };

    const handleCancelMakeup = (id) => {
        setMakeupList((prev) => prev.filter((item) => item.id !== id));
    };

    // Breadcrumb 텍스트 계산
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
                        tabs={CLASS_TABS}
                        defaultKey={activeTab}
                        onChange={handleTabChange}
                    />
                </div>

                {/* 4. 본문 영역 */}

                {/* 4-A. 공지 목록 화면 (view7) */}
                {subView === 'notice-list' && (
                    <div className="notice-list-view">
                        <h2 className="notice-view-title">공지 목록</h2>
                        <div className="notice-card-list">
                            {NOTICES_DATA.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="notice-item-card"
                                    onClick={() => handleOpenNoticeDetail(notice)}
                                >
                                    <div className="notice-item-body">
                                        <span className="notice-item-meta">{notice.author} · {notice.date}</span>
                                        <h3 className="notice-item-title">{notice.title}</h3>
                                        <p className="notice-item-excerpt">{notice.excerpt}</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="notice-view-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenNoticeDetail(notice);
                                        }}
                                    >
                                        공지 보기
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4-B. 공지 상세 화면 (view8) */}
                {subView === 'notice-detail' && (
                    <div className="notice-detail-view">
                        <div className="notice-detail-card">
                            <span className="notice-detail-meta">{selectedNotice.author} · {selectedNotice.date}</span>
                            <h2 className="notice-detail-title">{selectedNotice.title}</h2>
                            <div className="notice-detail-divider" />
                            <div className="notice-detail-body">
                                {selectedNotice.content.map((paragraph, idx) => (
                                    <p key={idx} className="notice-detail-paragraph">
                                        {paragraph.startsWith('신청 링크:') ? (
                                            <>
                                                신청 링크:{' '}
                                                <a href="#apply" className="notice-inline-link">
                                                    https://refit.example/apply
                                                </a>
                                            </>
                                        ) : (
                                            paragraph
                                        )}
                                    </p>
                                ))}
                            </div>
                            <div className="notice-detail-footer">
                                <button
                                    type="button"
                                    className="notice-back-btn"
                                    onClick={handleBackToNoticeList}
                                >
                                    ‹ 공지 목록으로 돌아가기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4-C. 결석 신청 폼 화면 (view12) */}
                {subView === 'absence-apply' && (
                    <div className="apply-view-wrapper">
                        <h2 className="apply-section-guide-title">신청할 날짜를 선택해주세요</h2>
                        <div className="apply-two-columns">
                            {/* 좌측 캘린더 (날짜 클릭 지원) */}
                            <div className="apply-calendar-column">
                                <Calendar
                                    mode="attendance"
                                    onSelectDate={handleSelectAbsenceDateFromCalendar}
                                    selectedDate={absenceDay}
                                />
                            </div>

                            {/* 우측 신청 정보 폼 */}
                            <div className="apply-form-column">
                                <h3 className="apply-form-title">신청 정보</h3>
                                <form onSubmit={handleSubmitAbsence} className="apply-form-body">
                                    <label className="apply-field-label" htmlFor="absence-date">
                                        신청 날짜 <span style={{ color: '#F04444' }}>*</span>
                                    </label>
                                    <input
                                        id="absence-date"
                                        type="date"
                                        required
                                        className="apply-input"
                                        value={absenceDate}
                                        onChange={(e) => {
                                            setAbsenceDate(e.target.value);
                                            if (e.target.value.includes('-')) {
                                                const day = parseInt(e.target.value.split('-')[2], 10);
                                                setAbsenceDay(day);
                                            }
                                        }}
                                    />

                                    <label className="apply-field-label" htmlFor="absence-reason">신청 사유</label>
                                    <textarea
                                        id="absence-reason"
                                        className="apply-textarea"
                                        placeholder="사유를 입력해주세요"
                                        value={absenceReason}
                                        onChange={(e) => setAbsenceReason(e.target.value)}
                                    />

                                    <div className="apply-submit-btn-wrap">
                                        <Button text="신청하기" color="blue" width={140} type="submit" />
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* 하단 신청 내역 (view12 하단) */}
                        <div className="apply-bottom-history">
                            <h3 className="apply-history-title">신청 내역</h3>
                            <div className="content-card history-table-card">
                                <table className="class-table history-table">
                                    <thead>
                                        <tr>
                                            <th>날짜</th>
                                            <th>사유</th>
                                            <th style={{ textAlign: 'center' }}>상태</th>
                                            <th style={{ textAlign: 'right' }}>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {absenceList.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.date}</td>
                                                <td>{item.reason}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <Condition status={item.status} />
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {item.canCancel ? (
                                                        <button
                                                            type="button"
                                                            className="table-action-btn btn-cancel-action"
                                                            onClick={() => handleCancelAbsence(item.id)}
                                                        >
                                                            취소
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="table-action-btn">
                                                            상태 보기
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4-D. 보강 신청 폼 화면 (view13) */}
                {subView === 'makeup-apply' && (
                    <div className="apply-view-wrapper">
                        <h2 className="apply-section-guide-title">신청할 날짜를 선택해주세요</h2>
                        <div className="apply-two-columns">
                            {/* 좌측 캘린더 (날짜 클릭 지원) */}
                            <div className="apply-calendar-column">
                                <Calendar
                                    mode="attendance"
                                    onSelectDate={handleSelectMakeupDateFromCalendar}
                                    selectedDate={makeupDay}
                                />
                            </div>

                            {/* 우측 신청 정보 폼 */}
                            <div className="apply-form-column">
                                <h3 className="apply-form-title">신청 정보</h3>
                                <form onSubmit={handleSubmitMakeup} className="apply-form-body">
                                    <label className="apply-field-label" htmlFor="makeup-date">
                                        신청 날짜 <span style={{ color: '#F04444' }}>*</span>
                                    </label>
                                    <input
                                        id="makeup-date"
                                        type="date"
                                        required
                                        className="apply-input"
                                        value={makeupDate}
                                        onChange={(e) => {
                                            setMakeupDate(e.target.value);
                                            if (e.target.value.includes('-')) {
                                                const day = parseInt(e.target.value.split('-')[2], 10);
                                                setMakeupDay(day);
                                            }
                                        }}
                                    />

                                    <label className="apply-field-label" htmlFor="makeup-start-time">
                                        보강 시간 <span style={{ color: '#F04444' }}>*</span>
                                    </label>
                                    <div className="apply-time-row">
                                        <input
                                            id="makeup-start-time"
                                            type="time"
                                            required
                                            className={`apply-input apply-time-input ${isTimeInvalid ? 'input-error' : ''}`}
                                            value={makeupStartTime}
                                            onChange={(e) => setMakeupStartTime(e.target.value)}
                                        />
                                        <span className="apply-time-tilde">~</span>
                                        <input
                                            id="makeup-end-time"
                                            type="time"
                                            required
                                            className={`apply-input apply-time-input ${isTimeInvalid ? 'input-error' : ''}`}
                                            value={makeupEndTime}
                                            onChange={(e) => setMakeupEndTime(e.target.value)}
                                        />
                                    </div>
                                    {isTimeInvalid && (
                                        <p className="apply-time-error-text" style={{ color: '#F04444', fontSize: '13px', margin: '6px 0 0 0' }}>
                                            시작 시간은 종료 시간보다 앞서야 합니다.
                                        </p>
                                    )}

                                    <label className="apply-field-label" htmlFor="makeup-reason">신청 사유</label>
                                    <textarea
                                        id="makeup-reason"
                                        className="apply-textarea"
                                        placeholder="사유를 입력해주세요"
                                        value={makeupReason}
                                        onChange={(e) => setMakeupReason(e.target.value)}
                                    />

                                    <div className="apply-submit-btn-wrap">
                                        <Button
                                            text="신청하기"
                                            color="blue"
                                            width={140}
                                            type="submit"
                                            disabled={isTimeInvalid}
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* 하단 신청 내역 (view13 하단) */}
                        <div className="apply-bottom-history">
                            <h3 className="apply-history-title">신청 내역</h3>
                            <div className="content-card history-table-card">
                                <table className="class-table history-table">
                                    <thead>
                                        <tr>
                                            <th>날짜</th>
                                            <th>보강 시간</th>
                                            <th>사유</th>
                                            <th style={{ textAlign: 'center' }}>상태</th>
                                            <th style={{ textAlign: 'right' }}>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {makeupList.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.date}</td>
                                                <td>{item.time}</td>
                                                <td>{item.reason}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <Condition status={item.status} />
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {item.canCancel ? (
                                                        <button
                                                            type="button"
                                                            className="table-action-btn btn-cancel-action"
                                                            onClick={() => handleCancelMakeup(item.id)}
                                                        >
                                                            취소
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="table-action-btn">
                                                            상태 보기
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4-E. 일반 탭 화면 (view5 메인, view10 결석일정, view11 보강일정) */}
                {subView === 'tab' && (
                    <div className="class-two-columns">
                        {/* 좌측 캘린더 (출결 모드) */}
                        <aside className="class-calendar-aside">
                            <Calendar mode="attendance" />
                        </aside>

                        {/* 우측 탭별 상세 내용 */}
                        <main className="class-content-area">
                            {/* TAB 1: 메인 탭 (view5) */}
                            {activeTab === 'main' && (
                                <div className="class-main-tab-content">
                                    {/* 이번달 출석 현황 */}
                                    <section className="attendance-status-section">
                                        <div className="attendance-status-header">
                                            <h2 className="content-section-title">이번달 출석 현황</h2>
                                            <div className="attendance-pills">
                                                <span className="attendance-pill pill-present">출석 3/9</span>
                                                <span className="attendance-pill pill-absent">결석 5</span>
                                            </div>
                                        </div>

                                        {/* 최근 출석 카드 */}
                                        <div className="content-card recent-attendance-card">
                                            <h3 className="card-subtitle">최근 출석</h3>
                                            <table className="class-table">
                                                <thead>
                                                    <tr>
                                                        <th>날짜</th>
                                                        <th>수업</th>
                                                        <th style={{ textAlign: 'right' }}>상태</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>2026년 8월 27일</td>
                                                        <td>{title}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <Condition status="출석" />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>2026년 8월 25일</td>
                                                        <td>{title}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <Condition status="결석" />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>2026년 8월 20일</td>
                                                        <td>{title}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <Condition status="보강" />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* 공지 섹션 */}
                                    <section className="notice-section">
                                        <div className="notice-section-header">
                                            <h2 className="content-section-title">공지</h2>
                                            <button
                                                type="button"
                                                className="view-more-link"
                                                onClick={handleOpenNoticeList}
                                            >
                                                더보기
                                            </button>
                                        </div>

                                        <div className="content-card notice-preview-card">
                                            {NOTICES_DATA.slice(0, 2).map((notice, idx) => (
                                                <div
                                                    key={notice.id}
                                                    className="notice-preview-item"
                                                    onClick={() => handleOpenNoticeDetail(notice)}
                                                >
                                                    <span className="notice-preview-meta">
                                                        {notice.author} · {notice.date}
                                                    </span>
                                                    <h3 className="notice-preview-title">{notice.title}</h3>
                                                    <p className="notice-preview-desc">{notice.excerpt}</p>
                                                    {idx === 0 && <div className="notice-preview-divider" />}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* TAB 2: 결석 일정 탭 (view10) */}
                            {activeTab === 'absence' && (
                                <div className="class-absence-tab-content">
                                    <div className="absence-section-header">
                                        <h2 className="content-section-title">신청 내역</h2>
                                        <Button
                                            text="+ 결석 신청하기"
                                            color="blue"
                                            width={130}
                                            onClick={() => setSubView('absence-apply')}
                                        />
                                    </div>

                                    <div className="content-card absence-table-card">
                                        <table className="class-table absence-table">
                                            <thead>
                                                <tr>
                                                    <th>날짜</th>
                                                    <th>신청 내용</th>
                                                    <th style={{ textAlign: 'center' }}>상태</th>
                                                    <th style={{ textAlign: 'right' }}>관리</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {absenceList.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.date}</td>
                                                        <td>{item.reason}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <Condition status={item.status} />
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            {item.canCancel ? (
                                                                <button
                                                                    type="button"
                                                                    className="table-action-btn btn-cancel-action"
                                                                    onClick={() => handleCancelAbsence(item.id)}
                                                                >
                                                                    취소
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="table-action-btn"
                                                                    onClick={() => alert(`${item.date} 상세 정보`)}
                                                                >
                                                                    보기
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: 보강 일정 탭 (view11) */}
                            {activeTab === 'makeup' && (
                                <div className="class-makeup-tab-content">
                                    <div className="absence-section-header">
                                        <h2 className="content-section-title">신청 내역</h2>
                                        <Button
                                            text="+ 보강 신청하기"
                                            color="blue"
                                            width={130}
                                            onClick={() => setSubView('makeup-apply')}
                                        />
                                    </div>

                                    <div className="content-card absence-table-card">
                                        <table className="class-table absence-table">
                                            <thead>
                                                <tr>
                                                    <th>날짜</th>
                                                    <th>보강 시간</th>
                                                    <th style={{ textAlign: 'center' }}>상태</th>
                                                    <th style={{ textAlign: 'right' }}>관리</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {makeupList.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.date}</td>
                                                        <td>{item.time}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <Condition status={item.status} />
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            {item.canCancel ? (
                                                                <button
                                                                    type="button"
                                                                    className="table-action-btn btn-cancel-action"
                                                                    onClick={() => handleCancelMakeup(item.id)}
                                                                >
                                                                    취소
                                                                </button>
                                                            ) : (
                                                                <button type="button" className="table-action-btn">
                                                                    보기
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Class;
