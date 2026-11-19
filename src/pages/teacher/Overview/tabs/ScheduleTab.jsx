import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  getClassSchedules,
  getClassStudents,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
} from "../../../../api/overviewApi.js";

const DAYS_OPTIONS = [
  { label: "월", fullLabel: "월요일", key: "mon", offset: 0 },
  { label: "화", fullLabel: "화요일", key: "tue", offset: 1 },
  { label: "수", fullLabel: "수요일", key: "wed", offset: 2 },
  { label: "목", fullLabel: "목요일", key: "thu", offset: 3 },
  { label: "금", fullLabel: "금요일", key: "fri", offset: 4 },
  { label: "토", fullLabel: "토요일", key: "sat", offset: 5 },
  { label: "일", fullLabel: "일요일", key: "sun", offset: 6 },
];

const JS_DAY_TO_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const SCHEDULE_STYLES = `
  .form-section .schedule-top-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .form-section .schedule-top-row .form-control {
    width: 200px;
  }

  .form-section .schedule-top-row .form-control:disabled {
    background-color: #f5f5f5;
    color: #777;
    cursor: not-allowed;
  }

  .form-section .day-select-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .form-section .day-time-item {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .form-section .time-input-box {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 94px;
    height: 38px;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
  }

  .form-section .time-input-box:focus-within {
    border-color: #0099ff;
  }

  .form-section .time-placeholder {
    position: absolute;
    left: 12px;
    font-size: 13px;
    color: #999;
    pointer-events: none;
  }

  .form-section .day-time-input {
    width: 100%;
    height: 100%;
    padding: 0 10px;
    border: 0;
    background: transparent;
    font-size: 13px;
    color: #151515;
    outline: none;
    cursor: pointer;
  }

  .form-section .time-input-box.is-empty .day-time-input::-webkit-datetime-edit {
    opacity: 0;
  }

  .form-section .time-input-box.is-empty .day-time-input:focus::-webkit-datetime-edit {
    opacity: 1;
  }

  .form-section .time-input-box.is-empty:focus-within .time-placeholder {
    display: none;
  }

  .form-section .day-time-input::-webkit-calendar-picker-indicator {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    opacity: 0;
    cursor: pointer;
  }

  .schedule-session-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  .schedule-session-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    white-space: nowrap;
  }

  .schedule-mini-btn {
    border: 1px solid #d9d9d9;
    background: #fff;
    color: #555;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 11px;
    cursor: pointer;
  }

  .schedule-mini-btn.is-delete {
    color: #e03131;
    border-color: #ffc9c9;
  }
`;

function parseServerDate(dateTimeStr) {
  if (!dateTimeStr) return new Date(NaN);
  return new Date(String(dateTimeStr).replace(" ", "T"));
}

function formatLocalDateTime(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function buildRangeForDay(dayKey, timeString) {
  const dayOption = DAYS_OPTIONS.find((d) => d.key === dayKey);
  const offset = dayOption ? dayOption.offset : 0;
  const [hours, minutes] = timeString.split(":").map(Number);

  const now = new Date();
  const currentJsDay = now.getDay();
  const diffToMonday = currentJsDay === 0 ? -6 : 1 - currentJsDay;

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diffToMonday + offset,
    hours,
    minutes,
    0,
    0
  );
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return {
    start_time: formatLocalDateTime(startDate),
    end_time: formatLocalDateTime(endDate),
  };
}

function buildRangeForDate(dateString, timeString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.split(":").map(Number);

  const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return {
    start_time: formatLocalDateTime(startDate),
    end_time: formatLocalDateTime(endDate),
  };
}

function groupSchedulesByStudent(schedules, students) {
  const studentNameMap = new Map();
  students.forEach((s) => {
    studentNameMap.set(s.studentId, s.name);
  });

  const groupedMap = new Map();

  schedules.forEach((item) => {
    const startObj = parseServerDate(item.startTime);
    if (Number.isNaN(startObj.getTime())) return;

    const dayKey = JS_DAY_TO_KEY[startObj.getDay()];
    const year = startObj.getFullYear();
    const month = String(startObj.getMonth() + 1).padStart(2, "0");
    const day = String(startObj.getDate()).padStart(2, "0");
    const formattedTime = `${String(startObj.getHours()).padStart(2, "0")}:${String(
      startObj.getMinutes()
    ).padStart(2, "0")}`;

    if (!groupedMap.has(item.studentId)) {
      groupedMap.set(item.studentId, {
        id: item.studentId,
        studentId: item.studentId,
        studentName:
          studentNameMap.get(item.studentId) || `학생 ${item.studentId}`,
        schedulesByDay: {
          mon: [],
          tue: [],
          wed: [],
          thu: [],
          fri: [],
          sat: [],
          sun: [],
        },
        allScheduleIds: [],
      });
    }

    const row = groupedMap.get(item.studentId);
    const scheduleId = item.scheduleId ?? item.id;
    row.schedulesByDay[dayKey].push({
      scheduleId,
      studentId: item.studentId,
      studentName: row.studentName,
      dateStr: `${year}-${month}-${day}`,
      shortDate: `${Number(month)}/${Number(day)}`,
      time: formattedTime,
      timestamp: startObj.getTime(),
    });
    row.allScheduleIds.push(scheduleId);
  });

  groupedMap.forEach((row) => {
    DAYS_OPTIONS.forEach((d) => {
      row.schedulesByDay[d.key].sort((a, b) => a.timestamp - b.timestamp);
    });
  });

  return Array.from(groupedMap.values());
}

function ScheduleTable({
  scheduleList,
  onEditSession,
  onDeleteSession,
  onDeleteStudent,
}) {
  return (
    <div className="table-wrapper">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>학생</th>
            {DAYS_OPTIONS.map((d) => (
              <th key={d.key}>{d.fullLabel}</th>
            ))}
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {scheduleList.map((item) => (
            <tr key={item.id}>
              <td>{item.studentName}</td>
              {DAYS_OPTIONS.map((d) => {
                const sessions = item.schedulesByDay[d.key] || [];
                return (
                  <td key={d.key}>
                    {sessions.length === 0 ? (
                      "—"
                    ) : (
                      <div className="schedule-session-list">
                        {sessions.map((session) => (
                          <div
                            key={session.scheduleId}
                            className="schedule-session-item"
                          >
                            <span>
                              {session.shortDate} {session.time}
                            </span>
                            <button
                              type="button"
                              className="schedule-mini-btn"
                              onClick={() => onEditSession(session)}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              className="schedule-mini-btn is-delete"
                              onClick={() =>
                                onDeleteSession(session.scheduleId)
                              }
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
              <td>
                <div className="action-buttons">
                  <Button
                    text="전체 삭제"
                    color="red"
                    width={76}
                    onClick={() => onDeleteStudent(item.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ScheduleTab({ classId, classroomId }) {
  const params = useParams();
  const activeClassId =
    classId ?? classroomId ?? params.classroomId ?? params.classId ?? params.id;

  const [isAdding, setIsAdding] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [scheduleStudent, setScheduleStudent] = useState("");
  const [daySchedules, setDaySchedules] = useState({});
  const [students, setStudents] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchedules = useCallback(async () => {
    if (!activeClassId) return;
    try {
      const [schedulesData, studentsData] = await Promise.all([
        getClassSchedules(activeClassId),
        getClassStudents(activeClassId).catch(() => []),
      ]);

      const safeStudents = Array.isArray(studentsData) ? studentsData : [];
      const safeSchedules = Array.isArray(schedulesData) ? schedulesData : [];

      setStudents(safeStudents);
      setScheduleList(groupSchedulesByStudent(safeSchedules, safeStudents));
    } catch (error) {
      console.error("시간표 목록 조회 실패:", error);
    }
  }, [activeClassId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const toggleDaySelection = (dayKey) => {
    setDaySchedules((prev) => {
      if (Object.prototype.hasOwnProperty.call(prev, dayKey)) {
        const next = { ...prev };
        delete next[dayKey];
        return next;
      }
      return { ...prev, [dayKey]: "" };
    });
  };

  const handleDayTimeChange = (dayKey, time) => {
    setDaySchedules((prev) => ({
      ...prev,
      [dayKey]: time,
    }));
  };

  const handleOpenCreateForm = () => {
    setEditingSession(null);
    setScheduleStudent("");
    setDaySchedules({});
    setIsAdding(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setScheduleStudent(session.studentName);
    setEditDate(session.dateStr);
    setEditTime(session.time);
    setIsAdding(true);
  };

  const handleUpdateSession = async () => {
    if (!editingSession || isSubmitting) return;
    if (!editDate || !editTime) {
      alert("수업 날짜와 시간을 모두 입력해주세요.");
      return;
    }

    const { start_time, end_time } = buildRangeForDate(editDate, editTime);

    try {
      setIsSubmitting(true);
      await updateClassSchedule(activeClassId, editingSession.scheduleId, {
        start_time,
        end_time,
      });
      await fetchSchedules();
      setEditingSession(null);
      setIsAdding(false);
    } catch (error) {
      alert(error.message || "시간표 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (isSubmitting) return;

    const selectedKeys = Object.keys(daySchedules);
    const hasEmptyTime = selectedKeys.some((key) => !daySchedules[key]);

    if (!scheduleStudent.trim() || selectedKeys.length === 0 || hasEmptyTime) {
      alert("학생 이름, 요일, 그리고 선택한 요일의 수업 시간을 모두 입력해주세요.");
      return;
    }

    const trimmedName = scheduleStudent.trim();
    const matchedStudent = students.find((s) => s.name === trimmedName);
    const existingRow = scheduleList.find(
      (item) => item.studentName === trimmedName
    );
    const targetStudentId = matchedStudent?.studentId ?? existingRow?.studentId;

    if (!targetStudentId) {
      alert("수업에 등록된 학생 이름을 정확히 입력해주세요.");
      return;
    }

    const requests = selectedKeys.map((dayKey) => {
      const { start_time, end_time } = buildRangeForDay(
        dayKey,
        daySchedules[dayKey]
      );
      return createClassSchedule(activeClassId, {
        student_id: targetStudentId,
        start_time,
        end_time,
      });
    });

    try {
      setIsSubmitting(true);
      await Promise.all(requests);
      await fetchSchedules();
      setIsAdding(false);
    } catch (error) {
      alert(error.message || "시간표 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (scheduleId) => {
    if (isSubmitting || !scheduleId) return;
    try {
      setIsSubmitting(true);
      await deleteClassSchedule(activeClassId, scheduleId);
      await fetchSchedules();
    } catch (error) {
      alert(error.message || "시간표 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (isSubmitting) return;
    const targetRow = scheduleList.find((item) => item.id === studentId);
    if (!targetRow || targetRow.allScheduleIds.length === 0) return;

    try {
      setIsSubmitting(true);
      await Promise.all(
        targetRow.allScheduleIds.map((scheduleId) =>
          deleteClassSchedule(activeClassId, scheduleId)
        )
      );
      await fetchSchedules();
    } catch (error) {
      alert(error.message || "시간표 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{SCHEDULE_STYLES}</style>
      {!isAdding ? (
        <section className="schedule-section">
          <h2 className="section-title">요일별 시간표</h2>
          <ScheduleTable
            scheduleList={scheduleList}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            onDeleteStudent={handleDeleteStudent}
          />
          <div className="bottom-action-bar">
            <Button
              text="+ 학생 시간표 등록"
              color="blue"
              width={140}
              onClick={handleOpenCreateForm}
            />
          </div>
        </section>
      ) : (
        <>
          <section className="form-section">
            <h2 className="form-title">
              {editingSession ? "학생 시간표 수정" : "학생 시간표 등록"}
            </h2>
            {editingSession ? (
              <div className="schedule-top-row">
                <input
                  type="text"
                  value={scheduleStudent}
                  disabled
                  className="form-control"
                />
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="form-control"
                />
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="form-control"
                />
                <Button
                  text="수정"
                  color="blue"
                  width={100}
                  onClick={handleUpdateSession}
                />
                <Button
                  text="취소"
                  color="lightGray"
                  width={80}
                  onClick={() => {
                    setEditingSession(null);
                    setIsAdding(false);
                  }}
                />
              </div>
            ) : (
              <>
                <div className="schedule-top-row">
                  <input
                    type="text"
                    list="schedule-student-options"
                    placeholder="학생 이름 입력"
                    value={scheduleStudent}
                    onChange={(e) => setScheduleStudent(e.target.value)}
                    className="form-control"
                  />
                  <datalist id="schedule-student-options">
                    {students.map((student) => (
                      <option key={student.studentId} value={student.name} />
                    ))}
                  </datalist>
                  <Button
                    text="등록"
                    color="blue"
                    width={100}
                    onClick={handleRegister}
                  />
                </div>

                <div className="day-select-group">
                  {DAYS_OPTIONS.map((d) => {
                    const isSelected = Object.prototype.hasOwnProperty.call(
                      daySchedules,
                      d.key
                    );
                    const timeValue = daySchedules[d.key] || "";

                    return (
                      <div key={d.key} className="day-time-item">
                        <button
                          type="button"
                          className={`day-chip ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => toggleDaySelection(d.key)}
                        >
                          {d.label}
                        </button>

                        {isSelected && (
                          <div
                            className={`time-input-box ${
                              !timeValue ? "is-empty" : ""
                            }`}
                          >
                            {!timeValue && (
                              <span className="time-placeholder">시간 선택</span>
                            )}
                            <input
                              type="time"
                              value={timeValue}
                              onClick={(e) => e.currentTarget.showPicker?.()}
                              onChange={(e) =>
                                handleDayTimeChange(d.key, e.target.value)
                              }
                              className="day-time-input"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <section className="list-section">
            <h2 className="section-title">등록된 시간표</h2>
            <ScheduleTable
              scheduleList={scheduleList}
              onEditSession={handleEditSession}
              onDeleteSession={handleDeleteSession}
              onDeleteStudent={handleDeleteStudent}
            />
          </section>
        </>
      )}
    </>
  );
}