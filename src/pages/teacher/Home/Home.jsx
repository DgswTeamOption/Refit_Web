import React from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SubNav from "../../../components/SubNav/SubNav";
import Nav from "../../../components/Nav/Nav";
import StudentTab from "../Overview/tabs/StudentTab";
import AbsenceTab from "../Overview/tabs/AbsenceTab";
import AttendanceTab from "../Overview/tabs/AttendanceTab";
import MakeupTab from "../Overview/tabs/MakeupTab";
import MakeupSettingTab from "../Overview/tabs/MakeupSettingTab";
import ScheduleTab from "../Overview/tabs/ScheduleTab";
import { getTeacherClassTitle } from "../classData";
import "./Home.css";

export default function Home() {
  const { classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const activeClassId = classId ?? "english1";
  const activeTab = searchParams.get("tab") || "makeup";
  const classTitle = getTeacherClassTitle(activeClassId, state?.classTitle);

  const handleTabChange = (key) => {
    if (key === "main") {
      navigate("/teacher/class/" + activeClassId, { state: { classTitle } });
      return;
    }
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
      <main className="teacher-overview-container">
        <Nav
          label="현재 위치"
          items={[
            { text: "홈", link: "/teacher" },
            { text: classTitle, link: "/teacher/class/" + activeClassId },
            { text: getBreadcrumbCurrent() },
          ]}
        />

        <h1 className="overview-title">{classTitle}</h1>

        <SubNav activeKey={activeTab} onChange={handleTabChange} />

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
