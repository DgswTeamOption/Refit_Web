import React, { useState } from "react";
import Header from "../../../components/Header/Header";
import SubNav from "../../../components/SubNav/SubNav";
import Condition from "../../../components/Condition/Condition";
import Button from "../../../components/Button/Button";
import "./Overview.css";

const DAYS_OPTIONS = [
  { label: "월", key: "mon" },
  { label: "화", key: "tue" },
  { label: "수", key: "wed" },
  { label: "목", key: "thu" },
  { label: "금", key: "fri" },
];

export default function Overview() {
  const [activeTab, setActiveTab] = useState("makeup");

  // 1. 학생 탭 (검색 기능 포함)
  const [studentSearchKeyword, setStudentSearchKeyword] = useState("");
  const [studentList] = useState([
    { id: 1, studentName: "김민지", makeupCount: "1 / 2", recentAbsence: "8월 27일", makeupStatus: "필요", makeupDaysNeeded: "1일" },
    { id: 2, studentName: "박서준", makeupCount: "0 / 1", recentAbsence: "8월 25일", makeupStatus: "불필요", makeupDaysNeeded: "0일" },
    { id: 3, studentName: "이서연", makeupCount: "2 / 3", recentAbsence: "8월 20일", makeupStatus: "필요", makeupDaysNeeded: "1일" },
  ]);

  const filteredStudentList = studentList.filter((item) =>
    item.studentName.includes(studentSearchKeyword)
  );

  // 2. 결석정보 탭
  const [absenceList, setAbsenceList] = useState([
    { id: 1, studentName: "김민지", date: "8월 27일", reason: "병원 방문", status: "대기중" },
    { id: 2, studentName: "박서준", date: "8월 25일", reason: "가족 일정", status: "수락됨" },
    { id: 3, studentName: "이서연", date: "8월 20일", reason: "개인 일정", status: "거절됨" },
  ]);

  const updateAbsenceStatus = (id, newStatus) => {
    setAbsenceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // 3. 출석 탭 (수정 버튼 누를 시 '대기중'으로 변경)
  const [attendanceList, setAttendanceList] = useState([
    { id: 1, studentName: "김민지", status: "출석" },
    { id: 2, studentName: "박서준", status: "출석" },
    { id: 3, studentName: "이서연", status: "결석" },
  ]);

  const handleStartEditAttendance = (id) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "대기중" } : item))
    );
  };

  const handleSelectAttendance = (id, newStatus) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // 4. 보강 탭
  const [makeupList, setMakeupList] = useState([
    { id: 1, studentName: "김민지", date: "8월 29일", time: "16:00", status: "대기중" },
    { id: 2, studentName: "이서연", date: "8월 30일", time: "17:00", status: "수락됨" },
    { id: 3, studentName: "박서준", date: "8월 31일", time: "15:00", status: "거절됨" },
  ]);

  const updateMakeupStatus = (id, newStatus) => {
    setMakeupList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // 5. 보강설정 탭
  const [isAddingSetting, setIsAddingSetting] = useState(false);
  const [editingSettingId, setEditingSettingId] = useState(null);
  const [settingDate, setSettingDate] = useState("");
  const [settingStartTime, setSettingStartTime] = useState("");
  const [settingEndTime, setSettingEndTime] = useState("");
  const [availableList, setAvailableList] = useState([
    { id: 1, date: "8월 29일", startTime: "16:00", endTime: "18:00" },
    { id: 2, date: "8월 30일", startTime: "17:00", endTime: "19:00" },
  ]);

  const handleOpenSettingForm = () => {
    setEditingSettingId(null);
    setSettingDate("");
    setSettingStartTime("");
    setSettingEndTime("");
    setIsAddingSetting(true);
  };

  const handleEditSetting = (item) => {
    setEditingSettingId(item.id);
    setSettingDate(item.date);
    setSettingStartTime(item.startTime);
    setSettingEndTime(item.endTime);
    setIsAddingSetting(true);
  };

  const handleSaveSetting = () => {
    if (!settingDate || !settingStartTime || !settingEndTime) return;

    if (editingSettingId) {
      setAvailableList((prev) =>
        prev.map((item) =>
          item.id === editingSettingId
            ? { ...item, date: settingDate, startTime: settingStartTime, endTime: settingEndTime }
            : item
        )
      );
    } else {
      setAvailableList((prev) => [
        ...prev,
        { id: Date.now(), date: settingDate, startTime: settingStartTime, endTime: settingEndTime },
      ]);
    }

    setEditingSettingId(null);
    setSettingDate("");
    setSettingStartTime("");
    setSettingEndTime("");
    setIsAddingSetting(false);
  };

  const handleDeleteSetting = (id) => {
    setAvailableList((prev) => prev.filter((item) => item.id !== id));
  };

  // 6. 스케줄 관리 탭
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleStudent, setScheduleStudent] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleList, setScheduleList] = useState([
    { id: 1, studentName: "김민지", mon: "16:00", tue: "—", wed: "16:00", thu: "—", fri: "17:00" },
    { id: 2, studentName: "박서준", mon: "15:00", tue: "15:00", wed: "15:00", thu: "15:00", fri: "15:00" },
    { id: 3, studentName: "이서연", mon: "17:00", tue: "—", wed: "17:00", thu: "—", fri: "—" },
  ]);

  const toggleDaySelection = (dayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((k) => k !== dayKey) : [...prev, dayKey]
    );
  };

  const handleOpenScheduleForm = () => {
    setEditingScheduleId(null);
    setScheduleStudent("");
    setSelectedDays([]);
    setScheduleTime("");
    setIsAddingSchedule(true);
  };

  const handleEditSchedule = (item) => {
    setEditingScheduleId(item.id);
    setScheduleStudent(item.studentName);

    const activeDays = [];
    if (item.mon !== "—") activeDays.push("mon");
    if (item.tue !== "—") activeDays.push("tue");
    if (item.wed !== "—") activeDays.push("wed");
    if (item.thu !== "—") activeDays.push("thu");
    if (item.fri !== "—") activeDays.push("fri");

    setSelectedDays(activeDays);
    const existingTime = [item.mon, item.tue, item.wed, item.thu, item.fri].find((t) => t !== "—");
    setScheduleTime(existingTime || "");
    setIsAddingSchedule(true);
  };

  const handleRegisterSchedule = () => {
    if (!scheduleStudent || selectedDays.length === 0 || !scheduleTime) return;

    if (editingScheduleId) {
      setScheduleList((prev) =>
        prev.map((item) => {
          if (item.id === editingScheduleId) {
            const updated = { ...item, studentName: scheduleStudent };
            DAYS_OPTIONS.forEach((d) => {
              updated[d.key] = selectedDays.includes(d.key) ? scheduleTime : "—";
            });
            return updated;
          }
          return item;
        })
      );
    } else {
      setScheduleList((prev) => {
        const existingIndex = prev.findIndex((item) => item.studentName === scheduleStudent);
        const dayUpdates = {};
        DAYS_OPTIONS.forEach((d) => {
          dayUpdates[d.key] = selectedDays.includes(d.key) ? scheduleTime : "—";
        });

        if (existingIndex > -1) {
          return prev.map((item, idx) =>
            idx === existingIndex ? { ...item, ...dayUpdates } : item
          );
        }
        return [
          ...prev,
          {
            id: Date.now(),
            studentName: scheduleStudent,
            mon: "—",
            tue: "—",
            wed: "—",
            thu: "—",
            fri: "—",
            ...dayUpdates,
          },
        ];
      });
    }

    setEditingScheduleId(null);
    setScheduleStudent("");
    setSelectedDays([]);
    setScheduleTime("");
    setIsAddingSchedule(false);
  };

  const handleDeleteSchedule = (id) => {
    setScheduleList((prev) => prev.filter((item) => item.id !== id));
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
        return isAddingSetting
          ? editingSettingId
            ? "보강 가능 시간 수정"
            : "보강 가능 시간 추가"
          : "보강설정";
      case "schedule":
        return isAddingSchedule
          ? editingScheduleId
            ? "학생 시간표 수정"
            : "학생 시간표 등록"
          : "스케줄 관리";
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

        {/* 1. 학생 탭 */}
        {activeTab === "student" && (
          <div className="overview-content">
            <div className="search-bar-wrapper">
              <input
                type="text"
                placeholder="학생 이름 검색"
                className="student-search-input"
                value={studentSearchKeyword}
                onChange={(e) => setStudentSearchKeyword(e.target.value)}
              />
            </div>
            <div className="table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>학생</th>
                    <th>보강 / 총 결석</th>
                    <th>최근 결석</th>
                    <th>보강 여부</th>
                    <th>보강 필요 일수</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.studentName}</td>
                      <td>{item.makeupCount}</td>
                      <td>{item.recentAbsence}</td>
                      <td>
                        <Condition status={item.makeupStatus} />
                      </td>
                      <td>{item.makeupDaysNeeded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. 결석정보 탭 */}
        {activeTab === "absence" && (
          <div className="overview-content">
            <div className="table-wrapper">
              <table className="absence-table">
                <thead>
                  <tr>
                    <th>학생</th>
                    <th>결석 날짜</th>
                    <th>사유</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {absenceList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.studentName}</td>
                      <td>{item.date}</td>
                      <td>{item.reason}</td>
                      <td>
                        <Condition status={item.status} />
                      </td>
                      <td>
                        <div className="action-buttons">
                          {item.status === "대기중" ? (
                            <>
                              <Button
                                text="수락"
                                color="blue"
                                width={60}
                                onClick={() => updateAbsenceStatus(item.id, "수락됨")}
                              />
                              <Button
                                text="거절"
                                color="red"
                                width={60}
                                onClick={() => updateAbsenceStatus(item.id, "거절됨")}
                              />
                            </>
                          ) : (
                            <Button
                              text="수정"
                              color="lightGray"
                              width={60}
                              onClick={() => updateAbsenceStatus(item.id, "대기중")}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. 출석 탭 */}
        {activeTab === "attendance" && (
          <div className="overview-content">
            <div className="section-date-title">2026년 8월 27일</div>
            <div className="table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>학생</th>
                    <th>출석 상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.studentName}</td>
                      <td>
                        <Condition status={item.status} />
                      </td>
                      <td>
                        <div className="action-buttons">
                          {item.status === "대기중" ? (
                            <>
                              <Button
                                text="출석"
                                color="blue"
                                width={60}
                                onClick={() => handleSelectAttendance(item.id, "출석")}
                              />
                              <Button
                                text="결석"
                                color="red"
                                width={60}
                                onClick={() => handleSelectAttendance(item.id, "결석")}
                              />
                            </>
                          ) : (
                            <Button
                              text="수정"
                              color="lightGray"
                              width={60}
                              onClick={() => handleStartEditAttendance(item.id)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. 보강 탭 */}
        {activeTab === "makeup" && (
          <div className="overview-content">
            <div className="table-wrapper">
              <table className="makeup-table">
                <thead>
                  <tr>
                    <th>학생</th>
                    <th>보강 날짜</th>
                    <th>시간</th>
                    <th>승인 상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {makeupList.map((item) => (
                    <tr key={item.id}>
                      <td>{item.studentName}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>
                        <Condition status={item.status} />
                      </td>
                      <td>
                        <div className="action-buttons">
                          {item.status === "대기중" ? (
                            <>
                              <Button
                                text="수락"
                                color="blue"
                                width={60}
                                onClick={() => updateMakeupStatus(item.id, "수락됨")}
                              />
                              <Button
                                text="거절"
                                color="red"
                                width={60}
                                onClick={() => updateMakeupStatus(item.id, "거절됨")}
                              />
                            </>
                          ) : (
                            <Button
                              text="수정"
                              color="lightGray"
                              width={60}
                              onClick={() => updateMakeupStatus(item.id, "대기중")}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. 보강설정 탭 */}
        {activeTab === "makeup-setting" && (
          <div className="overview-content">
            {!isAddingSetting ? (
              <>
                <div className="section-header-title">보강 가능 시간</div>
                <div className="table-wrapper">
                  <table className="setting-table">
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>시작 시간</th>
                        <th>종료 시간</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableList.map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.startTime}</td>
                          <td>{item.endTime}</td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                text="수정"
                                color="lightGray"
                                width={60}
                                onClick={() => handleEditSetting(item)}
                              />
                              <Button
                                text="삭제"
                                color="red"
                                width={60}
                                onClick={() => handleDeleteSetting(item.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bottom-action-bar">
                  <Button
                    text="+ 가능 시간 추가"
                    color="blue"
                    width={130}
                    onClick={handleOpenSettingForm}
                  />
                </div>
              </>
            ) : (
              <>
                <section className="form-section">
                  <h2 className="form-title">
                    {editingSettingId ? "보강 가능 시간 수정" : "보강 가능 시간 추가"}
                  </h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>날짜</label>
                      <input
                        type="text"
                        placeholder="날짜 선택"
                        value={settingDate}
                        onChange={(e) => setSettingDate(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>시작 시간</label>
                      <input
                        type="text"
                        placeholder="시간 선택"
                        value={settingStartTime}
                        onChange={(e) => setSettingStartTime(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>종료 시간</label>
                      <input
                        type="text"
                        placeholder="시간 선택"
                        value={settingEndTime}
                        onChange={(e) => setSettingEndTime(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-submit">
                      <Button
                        text={editingSettingId ? "수정" : "저장"}
                        color="blue"
                        width={90}
                        onClick={handleSaveSetting}
                      />
                    </div>
                  </div>
                </section>

                <section className="list-section">
                  <h2 className="section-title">등록된 가능 시간</h2>
                  <div className="table-wrapper">
                    <table className="setting-table">
                      <thead>
                        <tr>
                          <th>날짜</th>
                          <th>시작 시간</th>
                          <th>종료 시간</th>
                          <th>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableList.map((item) => (
                          <tr key={item.id}>
                            <td>{item.date}</td>
                            <td>{item.startTime}</td>
                            <td>{item.endTime}</td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  text="수정"
                                  color="lightGray"
                                  width={60}
                                  onClick={() => handleEditSetting(item)}
                                />
                                <Button
                                  text="삭제"
                                  color="red"
                                  width={60}
                                  onClick={() => handleDeleteSetting(item.id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* 6. 스케줄 관리 탭 */}
        {activeTab === "schedule" && (
          <div className="overview-content">
            {!isAddingSchedule ? (
              <>
                <section className="schedule-section">
                  <h2 className="section-title">요일별 시간표</h2>
                  <div className="table-wrapper">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>학생</th>
                          <th>월요일</th>
                          <th>화요일</th>
                          <th>수요일</th>
                          <th>목요일</th>
                          <th>금요일</th>
                          <th>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleList.map((item) => (
                          <tr key={item.id}>
                            <td>{item.studentName}</td>
                            <td>{item.mon}</td>
                            <td>{item.tue}</td>
                            <td>{item.wed}</td>
                            <td>{item.thu}</td>
                            <td>{item.fri}</td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  text="수정"
                                  color="lightGray"
                                  width={60}
                                  onClick={() => handleEditSchedule(item)}
                                />
                                <Button
                                  text="삭제"
                                  color="red"
                                  width={60}
                                  onClick={() => handleDeleteSchedule(item.id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bottom-action-bar">
                    <Button
                      text="+ 학생 시간표 등록"
                      color="blue"
                      width={140}
                      onClick={handleOpenScheduleForm}
                    />
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="form-section">
                  <h2 className="form-title">
                    {editingScheduleId ? "학생 시간표 수정" : "학생 시간표 등록"}
                  </h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>학생</label>
                      <input
                        type="text"
                        placeholder="학생 이름 입력"
                        value={scheduleStudent}
                        onChange={(e) => setScheduleStudent(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>요일</label>
                      <div className="day-select-group">
                        {DAYS_OPTIONS.map((d) => {
                          const isSelected = selectedDays.includes(d.key);
                          return (
                            <button
                              key={d.key}
                              type="button"
                              className={`day-chip ${isSelected ? "is-selected" : ""}`}
                              onClick={() => toggleDaySelection(d.key)}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>수업 시간</label>
                      <input
                        type="text"
                        placeholder="시간 선택"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-submit">
                      <Button
                        text={editingScheduleId ? "수정" : "등록"}
                        color="blue"
                        width={90}
                        onClick={handleRegisterSchedule}
                      />
                    </div>
                  </div>
                </section>

                <section className="list-section">
                  <h2 className="section-title">등록된 시간표</h2>
                  <div className="table-wrapper">
                    <table className="schedule-table">
                      <thead>
                        <tr>
                          <th>학생</th>
                          <th>월요일</th>
                          <th>화요일</th>
                          <th>수요일</th>
                          <th>목요일</th>
                          <th>금요일</th>
                          <th>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleList.map((item) => (
                          <tr key={item.id}>
                            <td>{item.studentName}</td>
                            <td>{item.mon}</td>
                            <td>{item.tue}</td>
                            <td>{item.wed}</td>
                            <td>{item.thu}</td>
                            <td>{item.fri}</td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  text="수정"
                                  color="lightGray"
                                  width={60}
                                  onClick={() => handleEditSchedule(item)}
                                />
                                <Button
                                  text="삭제"
                                  color="red"
                                  width={60}
                                  onClick={() => handleDeleteSchedule(item.id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}