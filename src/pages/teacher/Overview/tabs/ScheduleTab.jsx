import React, { useState } from "react";
import Button from "../../../../components/Button/Button";

const DAYS_OPTIONS = [
  { label: "월", fullLabel: "월요일", key: "mon" },
  { label: "화", fullLabel: "화요일", key: "tue" },
  { label: "수", fullLabel: "수요일", key: "wed" },
  { label: "목", fullLabel: "목요일", key: "thu" },
  { label: "금", fullLabel: "금요일", key: "fri" },
  { label: "토", fullLabel: "토요일", key: "sat" },
  { label: "일", fullLabel: "일요일", key: "sun" },
];

const SCHEDULE_STYLES = `
  .form-section .schedule-top-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .form-section .schedule-top-row .form-control {
    width: 200px;
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
`;

function ScheduleTable({ scheduleList, onEdit, onDelete }) {
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
              <td>{item.mon}</td>
              <td>{item.tue}</td>
              <td>{item.wed}</td>
              <td>{item.thu}</td>
              <td>{item.fri}</td>
              <td>{item.sat}</td>
              <td>{item.sun}</td>
              <td>
                <div className="action-buttons">
                  <Button text="수정" color="lightGray" width={60} onClick={() => onEdit(item)} />
                  <Button text="삭제" color="red" width={60} onClick={() => onDelete(item.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ScheduleTab() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [scheduleStudent, setScheduleStudent] = useState("");
  const [daySchedules, setDaySchedules] = useState({});

  const [scheduleList, setScheduleList] = useState([
    { id: 1, studentName: "김민지", mon: "16:00", tue: "—", wed: "16:00", thu: "—", fri: "17:00", sat: "10:00", sun: "—" },
    { id: 2, studentName: "박서준", mon: "15:00", tue: "15:00", wed: "15:00", thu: "15:00", fri: "15:00", sat: "—", sun: "—" },
    { id: 3, studentName: "이서연", mon: "17:00", tue: "—", wed: "17:00", thu: "—", fri: "—", sat: "14:00", sun: "14:00" },
  ]);

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

  const handleOpenForm = () => {
    setEditingId(null);
    setScheduleStudent("");
    setDaySchedules({});
    setIsAdding(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setScheduleStudent(item.studentName);

    const existingSchedules = {};
    DAYS_OPTIONS.forEach((d) => {
      if (item[d.key] && item[d.key] !== "—") {
        existingSchedules[d.key] = item[d.key];
      }
    });

    setDaySchedules(existingSchedules);
    setIsAdding(true);
  };

  const handleRegister = () => {
    const selectedKeys = Object.keys(daySchedules);
    const hasEmptyTime = selectedKeys.some((key) => !daySchedules[key]);

    if (!scheduleStudent.trim() || selectedKeys.length === 0 || hasEmptyTime) {
      alert("학생 이름, 요일, 그리고 선택한 요일의 수업 시간을 모두 입력해주세요.");
      return;
    }

    const dayUpdates = {};
    DAYS_OPTIONS.forEach((d) => {
      dayUpdates[d.key] = daySchedules[d.key] || "—";
    });

    if (editingId) {
      setScheduleList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, studentName: scheduleStudent.trim(), ...dayUpdates }
            : item
        )
      );
    } else {
      setScheduleList((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.studentName === scheduleStudent.trim()
        );

        if (existingIndex > -1) {
          return prev.map((item, idx) =>
            idx === existingIndex ? { ...item, ...dayUpdates } : item
          );
        }
        return [
          ...prev,
          {
            id: Date.now(),
            studentName: scheduleStudent.trim(),
            ...dayUpdates,
          },
        ];
      });
    }

    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setScheduleList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <style>{SCHEDULE_STYLES}</style>
      {!isAdding ? (
        <section className="schedule-section">
          <h2 className="section-title">요일별 시간표</h2>
          <ScheduleTable scheduleList={scheduleList} onEdit={handleEdit} onDelete={handleDelete} />
          <div className="bottom-action-bar">
            <Button text="+ 학생 시간표 등록" color="blue" width={140} onClick={handleOpenForm} />
          </div>
        </section>
      ) : (
        <>
          <section className="form-section">
            <h2 className="form-title">{editingId ? "학생 시간표 수정" : "학생 시간표 등록"}</h2>
            <div className="schedule-top-row">
              <input
                type="text"
                placeholder="학생 이름 입력"
                value={scheduleStudent}
                onChange={(e) => setScheduleStudent(e.target.value)}
                className="form-control"
              />
              <Button
                text={editingId ? "수정" : "등록"}
                color="blue"
                width={100}
                onClick={handleRegister}
              />
            </div>

            <div className="day-select-group">
              {DAYS_OPTIONS.map((d) => {
                const isSelected = Object.prototype.hasOwnProperty.call(daySchedules, d.key);
                const timeValue = daySchedules[d.key] || "";

                return (
                  <div key={d.key} className="day-time-item">
                    <button
                      type="button"
                      className={`day-chip ${isSelected ? "is-selected" : ""}`}
                      onClick={() => toggleDaySelection(d.key)}
                    >
                      {d.label}
                    </button>

                    {isSelected && (
                      <div className={`time-input-box ${!timeValue ? "is-empty" : ""}`}>
                        {!timeValue && <span className="time-placeholder">시간 선택</span>}
                        <input
                          type="time"
                          value={timeValue}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          onChange={(e) => handleDayTimeChange(d.key, e.target.value)}
                          className="day-time-input"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="list-section">
            <h2 className="section-title">등록된 시간표</h2>
            <ScheduleTable scheduleList={scheduleList} onEdit={handleEdit} onDelete={handleDelete} />
          </section>
        </>
      )}
    </>
  );
}