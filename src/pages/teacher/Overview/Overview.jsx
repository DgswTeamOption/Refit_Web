import React, { useState } from "react";
import Header from "../../../components/Header/Header";
import SubNav from "../../../components/SubNav/SubNav";
import StudentTab from "./tabs/StudentTab";
import AbsenceTab from "./tabs/AbsenceTab";
import AttendanceTab from "./tabs/AttendanceTab";
import MakeupTab from "./tabs/MakeupTab";
import MakeupSettingTab from "./tabs/MakeupSettingTab";
import ScheduleTab from "./tabs/ScheduleTab";
import "./Overview.css";

export default function Overview() {
  const [activeTab, setActiveTab] = useState("makeup");

  const getBreadcrumbCurrent = () => {
    switch (activeTab) {
      case "student":
        return "학생";
      case "absence":
        return "결석정보";
      case "attendance":
        return "출석";
      case "makeup-setting":
        return "보강설정";
      case "schedule":
        return "스케줄 관리";
      case "makeup":
      default:
        return "보강";
    }
  };

  return (
    <div className="overview-page">
      <Header />

      <main className="overview-container">
        <nav className="breadcrumb">
          <span>홈</span>
          <span className="breadcrumb__separator">&gt;</span>
          <span>영어1</span>
          <span className="breadcrumb__separator">&gt;</span>
          <span className="breadcrumb__current">{getBreadcrumbCurrent()}</span>
        </nav>

        <h1 className="overview-title">영어1</h1>

        <SubNav defaultKey="makeup" onChange={(key) => setActiveTab(key)} />

        <div className="overview-content">
          {activeTab === "student" && <StudentTab />}
          {activeTab === "absence" && <AbsenceTab />}
          {activeTab === "attendance" && <AttendanceTab />}
          {activeTab === "makeup" && <MakeupTab />}
          {activeTab === "makeup-setting" && <MakeupSettingTab />}
          {activeTab === "schedule" && <ScheduleTab />}
        </div>
      </main>
    </div>
  );
}