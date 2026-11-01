import React, { useState, useRef, useEffect } from "react";
import "./SubNav.css";

export const DEFAULT_TABS = [
  { key: "main", label: "메인" },
  { key: "student", label: "학생" },
  { key: "absence", label: "결석정보" },
  { key: "attendance", label: "출석" },
  { key: "makeup", label: "보강" },
  { key: "makeup-setting", label: "보강설정" },
  { key: "schedule", label: "스케줄 관리" },
];

export default function SubNav({ tabs = DEFAULT_TABS, defaultKey, onChange }) {
  const [activeKey, setActiveKey] = useState(defaultKey ?? tabs[0].key);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef({});

  const select = (key) => {
    setActiveKey(key);
    onChange?.(key);
  };

  useEffect(() => {
    const activeTabEl = tabsRef.current[activeKey];
    if (activeTabEl) {
      setIndicatorStyle({
        left: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
      });
    }
  }, [activeKey, tabs]);

  return (
    <nav className="sub-nav" aria-label="메뉴">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            ref={(el) => (tabsRef.current[tab.key] = el)}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={`sub-nav__tab${isActive ? " is-active" : ""}`}
            onClick={() => select(tab.key)}
          >
            <span className="sub-nav__label" data-label={tab.label}>
              {tab.label}
            </span>
          </button>
        );
      })}
      <div className="sub-nav__indicator" style={indicatorStyle} />
    </nav>
  );
}