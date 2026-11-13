import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Overview.css';
import Calendar from '../../../components/Calendar/Calendar';
import ClassBlock from '../../../components/ClassBlock/ClassBlock';
import Button from '../../../components/Button/Button';
import JoinClassModal from './components/JoinClassModal';
import LeaveClassModal from './components/LeaveClassModal';

const SAMPLE_CLASSES = [
    { id: 'eng1', title: '영어1', color: 'peach' },
    { id: 'eng2', title: '영어2', color: 'lavender' },
    { id: 'math1', title: '수학1', color: 'yellow' },
    { id: 'math2', title: '수학2', color: 'mint' },
];

function Overview({ onSelectClass }) {
    const navigate = useNavigate();
    // 처음 로그인했을 때는 참여 중인 수업이 없도록 빈 배열([])로 시작
    const [classes, setClasses] = useState([]);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [targetClass, setTargetClass] = useState(null);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState(false);

    // 수업 참여 모달 열기
    const handleOpenJoinModal = () => {
        setJoinCode('');
        setJoinError(false);
        setIsJoinModalOpen(true);
    };

    // 수업 참여 처리 (비어 있지 않은 수업 코드 입력 시 수업 추가)
    const handleJoinSubmit = (e) => {
        e.preventDefault();
        const trimmed = joinCode.trim();
        if (!trimmed) {
            setJoinError(true);
            return;
        }

        const nextSample = SAMPLE_CLASSES[classes.length % SAMPLE_CLASSES.length];
        const newClass = {
            id: classes.length < SAMPLE_CLASSES.length ? nextSample.id : `class-${Date.now()}`,
            title: classes.length < SAMPLE_CLASSES.length ? nextSample.title : `새 수업 ${classes.length + 1}`,
            color: nextSample.color,
        };
        setClasses((prev) => [...prev, newClass]);
        setIsJoinModalOpen(false);
    };

    // 수업 나가기 모달 열기
    const handleOpenLeaveModal = (classItem) => {
        setTargetClass(classItem);
        setIsLeaveModalOpen(true);
    };

    // 수업 나가기 확정
    const handleConfirmLeave = () => {
        if (targetClass) {
            setClasses((prev) => prev.filter((item) => item.id !== targetClass.id));
        }
        setIsLeaveModalOpen(false);
        setTargetClass(null);
    };

    const handleCardClick = (cls) => {
        if (onSelectClass) {
            onSelectClass(cls);
        }
        navigate(`/class/${cls.id}`);
    };

    return (
        <div className="student-overview-page">
            <div className="overview-container">
                {/* 좌측 캘린더 영역 */}
                <aside className="overview-calendar-aside">
                    <Calendar mode="class" classes={classes} />
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

                    {/* 수업 목록이 있을 때 (view1) */}
                    {classes.length > 0 ? (
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
                                        onLeave={(e) => {
                                            e.stopPropagation();
                                            handleOpenLeaveModal(cls);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* 수업이 없을 때 빈 상태 (view2) */
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

            {/* 1. 수업 참여하기 모달 (view3) */}
            <JoinClassModal
                isOpen={isJoinModalOpen}
                joinCode={joinCode}
                joinError={joinError}
                onChangeCode={(value) => {
                    setJoinCode(value);
                    setJoinError(false);
                }}
                onSubmit={handleJoinSubmit}
                onClose={() => setIsJoinModalOpen(false)}
            />

            {/* 2. 수업 나가기 모달 (view4) */}
            <LeaveClassModal
                isOpen={isLeaveModalOpen}
                onConfirm={handleConfirmLeave}
                onClose={() => setIsLeaveModalOpen(false)}
            />
        </div>
    );
}

export default Overview;
