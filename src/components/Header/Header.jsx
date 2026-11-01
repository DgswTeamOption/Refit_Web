import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import logoImg from '../../assets/logo.svg';
import bellIcon from '../../assets/bell.svg';
import profileIcon from '../../assets/profile.png';

const Header = () => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [notifications, setNotifications] = useState([
        { id: 1, title: '영어1', description: '새 결석 신청이 도착했어요.', isUnread: true },
        { id: 2, title: '영어2', description: '새 보강 신청이 도착했어요.', isUnread: true },
        { id: 3, title: '수학1', description: '오늘 수업이 있어요.', isUnread: true },
        { id: 4, title: '수학2', description: '새 학생이 수업에 참여했어요.', isUnread: true },
    ]);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsNotificationOpen(false);
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleNotification = () => {
        setIsNotificationOpen((prev) => !prev);
        setIsProfileOpen(false);
    };

    const toggleProfile = () => {
        setIsProfileOpen((prev) => !prev);
        setIsNotificationOpen(false);
    };

    const handleMarkAllRead = () => {
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, isUnread: false }))
        );
    };

    const handleNotificationClick = (id) => {
        setNotifications((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isUnread: false } : item))
        );
    };

    return (
        <header className="refit-header">
            <div className="header-container">
                <div className="header-left">
                    <a href="/" className="header-logo-link" aria-label="Refit 홈으로 이동">
                        <img src={logoImg} alt="Refit 로고" className="header-logo" />
                    </a>
                </div>
                <div className="header-right">
                    <div className="header-action-wrapper" ref={notificationRef}>
                        <button
                            type="button"
                            className={`header-icon-btn notification-btn ${isNotificationOpen ? 'active' : ''}`}
                            onClick={toggleNotification}
                            aria-label="알림 확인"
                            aria-expanded={isNotificationOpen}
                        >
                            <img src={bellIcon} alt="알림 아이콘" className="header-bell-icon" />
                        </button>

                        {isNotificationOpen && (
                            <div className="popup-card notification-popup" role="dialog" aria-label="알림 목록">
                                <div className="notification-popup-header">
                                    <span className="notification-popup-title">알림</span>
                                    <button
                                        type="button"
                                        className="mark-all-read-btn"
                                        onClick={handleMarkAllRead}
                                    >
                                        모두 읽음
                                    </button>
                                </div>
                                <div className="notification-list">
                                    {notifications.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`notification-item ${item.isUnread ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(item.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    handleNotificationClick(item.id);
                                                }
                                            }}
                                        >
                                            <div className="notification-item-row">
                                                <span className={`unread-dot ${item.isUnread ? 'visible' : 'hidden'}`} />
                                                <div className="notification-item-content">
                                                    <span className="notification-item-title">{item.title}</span>
                                                    <p className="notification-item-desc">{item.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="header-action-wrapper" ref={profileRef}>
                        <button
                            type="button"
                            className={`header-icon-btn profile-btn ${isProfileOpen ? 'active' : ''}`}
                            onClick={toggleProfile}
                            aria-label="사용자 프로필"
                            aria-expanded={isProfileOpen}
                        >
                            <img src={profileIcon} alt="프로필 아이콘" className="header-profile-icon" />
                        </button>

                        {isProfileOpen && (
                            <div className="popup-card profile-popup" role="dialog" aria-label="프로필 메뉴">
                                <div className="profile-popup-header">
                                    <span className="profile-popup-name">선생님1</span>
                                </div>
                                <div className="profile-popup-divider" />
                                <ul className="profile-popup-menu">
                                    <li>
                                        <button
                                            type="button"
                                            className="profile-menu-item"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            정보수정
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            className="profile-menu-item"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            로그아웃
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
