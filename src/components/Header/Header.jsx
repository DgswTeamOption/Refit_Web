import React from 'react';
import './Header.css';
import logoImg from '../../assets/logo.png';
import bellIcon from '../../assets/bell.png';
import profileIcon from '../../assets/profile.png';

const Header = () => {
    return (
        <header className="refit-header">
            <div className="header-container">
                <div className="header-left">
                    <a href="/" className="header-logo-link" aria-label="Refit 홈으로 이동">
                        <img src={logoImg} alt="Refit 로고" className="header-logo" />
                    </a>
                </div>
                <div className="header-right">
                    <button type="button" className="header-icon-btn notification-btn" aria-label="알림 확인">
                        <img src={bellIcon} alt="알림 아이콘" className="header-bell-icon" />
                    </button>
                    <button type="button" className="header-icon-btn profile-btn" aria-label="사용자 프로필">
                        <img src={profileIcon} alt="프로필 아이콘" className="header-profile-icon" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
