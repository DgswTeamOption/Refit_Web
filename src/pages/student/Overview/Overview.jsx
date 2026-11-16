import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Overview.css';
import Calendar from '../../../components/Calendar/Calendar';
import ClassBlock from '../../../components/ClassBlock/ClassBlock';
import Button from '../../../components/Button/Button';
import JoinClassModal from './components/JoinClassModal';
import LeaveClassModal from './components/LeaveClassModal';
import studentApi from '../../../api/studentApi';

const CLASS_COLORS = ['peach', 'lavender', 'yellow', 'mint'];

function mapClassItem(item, index = 0) {
    return {
        id: item.id ?? item.classroomId,
        title: item.name || item.title || '수업',
        classCode: item.classCode || '',
        teacherName: item.teacherName || '',
        bannerImageUrl: item.bannerImageUrl || '',
        color: item.color || CLASS_COLORS[index % CLASS_COLORS.length],
    };
}

function Overview({ onSelectClass }) {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [targetClass, setTargetClass] = useState(null);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState(false);
    const [joinErrorMessage, setJoinErrorMessage] = useState('존재하지 않는 코드입니다.');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchClasses = async () => {
            setIsLoading(true);
            try {
                const data = await studentApi.getMyClasses(controller.signal);
                const list = Array.isArray(data) ? data : [];
                setClasses(list.map((item, idx) => mapClassItem(item, idx)));
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setClasses([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchClasses();
        return () => controller.abort();
    }, []);

    // 수업 참여 모달 열기
    const handleOpenJoinModal = useCallback(() => {
        setJoinCode('');
        setJoinError(false);
        setJoinErrorMessage('존재하지 않는 코드입니다.');
        setIsJoinModalOpen(true);
    }, []);

    // 수업 참여 처리 (POST /api/class/join)
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
            setClasses((prev) => [...prev, mapClassItem(joined, prev.length)]);
            setIsJoinModalOpen(false);
        } catch (err) {
            setJoinError(true);
            setJoinErrorMessage(err?.message || '존재하지 않는 코드입니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 수업 나가기 모달 열기
    const handleOpenLeaveModal = useCallback((classItem) => {
        setTargetClass(classItem);
        setIsLeaveModalOpen(true);
    }, []);

    // 수업 나가기 확정 (DELETE /api/class/{classroomId}/leave)
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

    const handleCardClick = useCallback((cls) => {
        if (onSelectClass) {
            onSelectClass(cls);
        }
        navigate(`/class/${cls.id}`, { state: { classInfo: cls } });
    }, [navigate, onSelectClass]);

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

            {/* 1. 수업 참여하기 모달 (view3) */}
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
