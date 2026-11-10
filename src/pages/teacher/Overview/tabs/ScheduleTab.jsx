import React, { useState } from "react";
import Button from "../../../../components/Button/Button";

// 요일 옵션에 토, 일 추가
const DAYS_OPTIONS = [
  { label: "월", key: "mon" },
  { label: "화", key: "tue" },
  { label: "수", key: "wed" },
  { label: "목", key: "thu" },
  { label: "금", key: "fri" },
  { label: "토", key: "sat" },
  { label: "일", key: "sun" },
];

// 재사용 시간표 테이블 하위 컴포넌트
function ScheduleTable({ scheduleList, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>학생</th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
            <th>목</th>
            <th>금</th>
            <th>토</th>
            <th>일</th>
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
  const [selectedDays, setSelectedDays] = useState([]);
  const [scheduleTime, setScheduleTime] = useState("");

  const [scheduleList, setScheduleList] = useState([
    { id: 1, studentName: "김민지", mon: "16:00", tue: "—", wed: "16:00", thu: "—", fri: "17:00", sat: "10:00", sun: "—" },
    { id: 2, studentName: "박서준", mon: "15:00", tue: "15:00", wed: "15:00", thu: "15:00", fri: "15:00", sat: "—", sun: "—" },
    { id: 3, studentName: "이서연", mon: "17:00", tue: "—", wed: "17:00", thu: "—", fri: "—", sat: "14:00", sun: "14:00" },
  ]);

  const toggleDaySelection = (dayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((k) => k !== dayKey) : [...prev, dayKey]
    );
  };

  const handleOpenForm = () => {
    setEditingId(null);
    setScheduleStudent("");
    setSelectedDays([]);
    setScheduleTime("");
    setIsAdding(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setScheduleStudent(item.studentName);

    const activeDays = [];
    if (item.mon !== "—") activeDays.push("mon");
    if (item.tue !== "—") activeDays.push("tue");
    if (item.wed !== "—") activeDays.push("wed");
    if (item.thu !== "—") activeDays.push("thu");
    if (item.fri !== "—") activeDays.push("fri");
    if (item.sat !== "—") activeDays.push("sat");
    if (item.sun !== "—") activeDays.push("sun");

    setSelectedDays(activeDays);
    const existingTime = [item.mon, item.tue, item.wed, item.thu, item.fri, item.sat, item.sun].find((t) => t !== "—");
    setScheduleTime(existingTime || "");
    setIsAdding(true);
  };

  const handleRegister = () => {
    if (!scheduleStudent || selectedDays.length === 0 || !scheduleTime) return;

    if (editingId) {
      setScheduleList((prev) =>
        prev.map((item) => {
          if (item.id === editingId) {
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
            mon: "—", tue: "—", wed: "—", thu: "—", fri: "—", sat: "—", sun: "—",
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
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-submit">
                <Button text={editingId ? "수정" : "등록"} color="blue" width={90} onClick={handleRegister} />
              </div>
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