import React, { useState } from 'react';
import './SubNav.css';

const SubNav = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'main', label: '메인' },
    { id: 'student', label: '학생' },
    { id: 'absence', label: '결석정보' },
    { id: 'attendance', label: '출석' },
    { id: 'makeup', label: '보강' },
    { id: 'makeup-setting', label: '보강설정' },
    { id: 'schedule', label: '스케줄 관리' },
  ];

  const [currentTab, setCurrentTab] = useState(navItems[0].id);

  const selectedTab = activeTab || currentTab;

  const handleTabClick = (id) => {
    if (onSelectTab) {
      onSelectTab(id);
    } else {
      setCurrentTab(id);
    }
  };

  return (
    <nav className="sub-nav">
      <ul className="sub-nav-list">
        {navItems.map((item) => {
          const isActive = selectedTab === item.id;
          return (
            <li
              key={item.id}
              className={`sub-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <button type="button" className="sub-nav-button">
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SubNav;