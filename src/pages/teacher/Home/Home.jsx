import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../../../components/Header/Header";
import SubNav from "../../../components/SubNav/SubNav";
import Nav from "../../../components/Nav/Nav";
import StudentTab from "../Overview/tabs/StudentTab";
import AbsenceTab from "../Overview/tabs/AbsenceTab";
import AttendanceTab from "../Overview/tabs/AttendanceTab";
import MakeupTab from "../Overview/tabs/MakeupTab";
import MakeupSettingTab from "../Overview/tabs/MakeupSettingTab";
import ScheduleTab from "../Overview/tabs/ScheduleTab";
import "./Home.css";

export default function Home() {
  const { classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeClassId = classId ?? "english1";
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "makeup");

  const handleTabChange = (key) => {
    if (key === "main") {
      navigate(`/teacher/class/${activeClassId}`);
      return;
    }
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

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
    <div className="teacher-overview-page">
      <Header onLogoClick={() => navigate("/teacher")} />

      <main className="teacher-overview-container">
        <Nav
          label="현재 위치"
          items={[
            { text: "홈", link: "/teacher" },
            { text: "영어1", link: `/teacher/class/${activeClassId}` },
            { text: getBreadcrumbCurrent() },
          ]}
        />

        <h1 className="overview-title">영어1</h1>

        <SubNav defaultKey={activeTab} onChange={handleTabChange} />

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
