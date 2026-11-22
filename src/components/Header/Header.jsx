import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import bellIcon from '../../assets/bell.svg';
import { fetchCurrentUserProfile, isAuthenticatedSession, logoutAuthSession } from '../../utils/auth';

function DefaultProfileAvatar({ className = 'header-profile-icon' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="20" cy="20" r="20" fill="#DBDBDB" />
            <circle cx="20" cy="14.5" r="6.5" fill="#FFFFFF" />
            <path
                d="M7.5 34.5C9.8 27.6 14.5 24 20 24C25.5 24 30.2 27.6 32.5 34.5C29.1 37.9 24.8 40 20 40C15.2 40 10.9 37.9 7.5 34.5Z"
                fill="#FFFFFF"
            />
        </svg>
    );
}

const Header = ({
    isLoggedIn: isLoggedInProp,
    userName = '학생1',
    initialNotifications = [],
    showServiceMenu = true,
    onLogoClick,
    onLoginClick,
    onSignupClick,
    onLogoutClick,
}) => {
    const navigate = useNavigate();
    const isLoggedIn = isLoggedInProp !== undefined
        ? isLoggedInProp
        : isAuthenticatedSession();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileName, setProfileName] = useState(userName);
    const [profileImageUrl, setProfileImageUrl] = useState('');

    // 초기 로그인 시에는 알림이 없도록 빈 배열 기본값 적용
    const [notifications, setNotifications] = useState(initialNotifications);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn) return undefined;

        const controller = new AbortController();

        const loadProfile = async () => {
            try {
                const profile = await fetchCurrentUserProfile({ signal: controller.signal });
                if (!profile) return;

                const name = profile?.name ?? profile?.userName ?? profile?.username ?? '';
                const imageUrl = profile?.profileImageUrl
                    ?? profile?.profile_image_url
                    ?? profile?.profileImage
                    ?? profile?.profile_image
                    ?? '';

                if (typeof name === 'string' && name.trim()) setProfileName(name.trim());
                if (typeof imageUrl === 'string') setProfileImageUrl(imageUrl.trim());
            } catch (error) {
                if (error?.name !== 'AbortError') {
                    setProfileName(userName || '학생1');
                    setProfileImageUrl('');
                }
            }
        };

        loadProfile();
        return () => controller.abort();
    }, [isLoggedIn, userName]);

    const unreadCount = notifications.filter((item) => item.isUnread).length;

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

    const handleLogoClick = onLogoClick || (() => navigate(isLoggedIn ? '/student' : '/login'));
    const handleLoginClick = onLoginClick || (() => navigate('/login'));
    const handleSignupClick = onSignupClick || (() => navigate('/signup'));
    const handleLogoutClick = async () => {
        if (onLogoutClick) {
            await onLogoutClick();
        } else {
            await logoutAuthSession();
            navigate('/login');
        }
    };

    return (
        <header className="refit-header">
            <div className="header-container">
                <div className="header-left">
                    <button
                        type="button"
                        onClick={handleLogoClick}
                        className="header-logo-link"
                        aria-label="Refit 홈으로 이동"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <img src="/logo.svg" alt="Refit 로고" className="header-logo" />
                    </button>

                    {/* 로그인 전 헤더 메뉴 (Header · 로그인 전) */}
                    {!isLoggedIn && showServiceMenu && (
                        <nav className="header-prelog-nav" aria-label="메인 메뉴">
                            <button type="button" className="header-prelog-link" onClick={() => navigate('/introduce#overview')}>서비스 소개</button>
                            <button type="button" className="header-prelog-link" onClick={() => navigate('/introduce#features')}>기능</button>
                            <button type="button" className="header-prelog-link" onClick={() => navigate('/introduce#start')}>이용 방법</button>
                            <button type="button" className="header-prelog-link" onClick={() => navigate('/introduce#ai')}>Refit AI</button>
                            <button type="button" className="header-prelog-link" onClick={() => navigate('/faq')}>FAQ</button>
                        </nav>
                    )}
                </div>
                <div className="header-right">
                    {/* 로그인 전: 로그인 및 회원가입 버튼 */}
                    {!isLoggedIn ? (
                        <div className="header-auth-buttons">
                            <button
                                type="button"
                                className="header-login-btn"
                                onClick={handleLoginClick}
                            >
                                로그인
                            </button>
                            <button
                                type="button"
                                className="header-signup-btn"
                                onClick={handleSignupClick}
                            >
                                회원가입
                            </button>
                        </div>
                    ) : (
                        /* 로그인 후: 알림 아이콘 & 프로필 아바타 */
                        <>
                            {/* 알림 아이콘 & 팝업 */}
                            <div className="header-action-wrapper" ref={notificationRef}>
                                <button
                                    type="button"
                                    className={`header-icon-btn notification-btn ${isNotificationOpen ? 'active' : ''}`}
                                    onClick={toggleNotification}
                                    aria-label="알림 확인"
                                    aria-expanded={isNotificationOpen}
                                >
                                    <img src={bellIcon} alt="알림 아이콘" className="header-bell-icon" />
                                    {unreadCount > 0 && <span className="header-bell-badge" />}
                                </button>

                                {isNotificationOpen && (
                                    <div className="popup-card notification-popup" role="dialog" aria-label="알림 목록">
                                        <div className="notification-popup-header">
                                            <span className="notification-popup-title">알림</span>
                                            {notifications.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="mark-all-read-btn"
                                                    onClick={handleMarkAllRead}
                                                >
                                                    모두 읽음
                                                </button>
                                            )}
                                        </div>
                                        <div className="notification-list">
                                            {notifications.length > 0 ? (
                                                notifications.map((item) => (
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
                                                ))
                                            ) : (
                                                <div style={{ padding: '24px 20px', textAlign: 'center', color: '#767B81', fontSize: '13px' }}>
                                                    새로운 알림이 없습니다.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 프로필 아이콘 & 팝업 */}
                            <div className="header-action-wrapper" ref={profileRef}>
                                <button
                                    type="button"
                                    className={`header-icon-btn profile-btn ${isProfileOpen ? 'active' : ''}`}
                                    onClick={toggleProfile}
                                    aria-label="사용자 프로필"
                                    aria-expanded={isProfileOpen}
                                >
                                    {profileImageUrl ? (
                                        <img
                                            src={profileImageUrl}
                                            alt="프로필 사진"
                                            className="header-profile-icon has-photo"
                                            onError={() => setProfileImageUrl('')}
                                        />
                                    ) : (
                                        <DefaultProfileAvatar className="header-profile-icon" />
                                    )}
                                </button>

                                {isProfileOpen && (
                                    <div className="popup-card profile-popup" role="dialog" aria-label="프로필 메뉴">
                                        <div className="profile-popup-header">
                                            <span className="profile-popup-name">{profileName}</span>
                                        </div>
                                        <div className="profile-popup-divider" />
                                        <ul className="profile-popup-menu">
                                            <li>
                                                <button
                                                    type="button"
                                                    className="profile-menu-item"
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        navigate('/personal-info');
                                                    }}
                                                >
                                                    정보수정
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    type="button"
                                                    className="profile-menu-item"
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        handleLogoutClick();
                                                    }}
                                                >
                                                    로그아웃
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
