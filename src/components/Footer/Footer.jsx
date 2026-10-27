import React from 'react';
import './Footer.css';
import logoImg from '../../assets/logo.png';
import githubIcon from '../../assets/github.png';

const Footer = () => {
    const frontendDevs = [
        { name: 'dohunjeon51-design', url: 'https://github.com/dohunjeon51-design' },
        { name: 'janginu89', url: 'https://github.com/janginu89' },
        { name: 'mingi-cpu', url: 'https://github.com/mingi-cpu' },
        { name: 'gkm100108', url: 'https://github.com/gkm100108' },
    ];

    const backendDevs = [
        { name: 'ahin042', url: 'https://github.com/ahin042' },
        { name: 'seojisu10', url: 'https://github.com/seojisu10' },
        { name: 'MAYO0622', url: 'https://github.com/MAYO0622' },
        { name: 'melon0019-cloud', url: 'https://github.com/melon0019-cloud' },
    ];

    return (
        <footer className="refit-footer">
            <div className="footer-container">
                <div className="footer-top">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <a href="/" className="footer-logo-link" aria-label="Refit 홈으로 이동">
                            <img src={logoImg} alt="Refit 로고" className="footer-logo" />
                        </a>
                        <p className="footer-slogan">
                            빈틈을 채우는 스마트한<br />
                            보강 관리, Refit과 함께하세요.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="footer-nav-groups">
                        {/* Developer Section */}
                        <div className="footer-column footer-developer-col">
                            <h3 className="footer-column-title">Developer</h3>

                            <div className="dev-group">
                                <h4 className="dev-group-title">Frontend</h4>
                                <div className="dev-grid">
                                    {frontendDevs.map((dev) => (
                                        <a
                                            key={dev.name}
                                            href={dev.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="dev-link"
                                        >
                                            <img src={githubIcon} alt="" className="github-icon" />
                                            <span>{dev.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="dev-group">
                                <h4 className="dev-group-title">Backend</h4>
                                <div className="dev-grid">
                                    {backendDevs.map((dev) => (
                                        <a
                                            key={dev.name}
                                            href={dev.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="dev-link"
                                        >
                                            <img src={githubIcon} alt="" className="github-icon" />
                                            <span>{dev.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Service Section */}
                        <div className="footer-column footer-service-col">
                            <h3 className="footer-column-title">Service</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="#service-intro" className="footer-link">서비스 소개</a>
                                </li>
                            </ul>
                        </div>

                        {/* Help Section */}
                        <div className="footer-column footer-help-col">
                            <h3 className="footer-column-title">Help</h3>
                            <ul className="footer-links">
                                <li>
                                    <a href="#faq" className="footer-link">FAQ</a>
                                </li>
                                <li>
                                    <a href="#terms" className="footer-link">이용 약관</a>
                                </li>
                                <li>
                                    <a href="#privacy" className="footer-link">개인정보 처리방침</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="footer-vertical-divider" aria-hidden="true" />

                    {/* Team GitHub Button */}
                    <div className="footer-team-github">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-github-btn"
                        >
                            <img src={githubIcon} alt="" className="team-github-icon" />
                            <span>Team GitHub</span>
                        </a>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="footer-bottom-wrapper">
                    <div className="footer-horizontal-divider" />
                    <div className="footer-bottom">
                        <p className="footer-copyright">© 2026 Refit. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
