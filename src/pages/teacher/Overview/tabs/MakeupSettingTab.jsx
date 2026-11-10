import React, { useState } from "react";
import Button from "../../../../components/Button/Button";

function SettingTable({ availableList, onEdit, onDelete }) {
  return (
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

export default function MakeupSettingTab() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [settingDate, setSettingDate] = useState("");
  const [settingStartTime, setSettingStartTime] = useState("");
  const [settingEndTime, setSettingEndTime] = useState("");

  const [availableList, setAvailableList] = useState([
    { id: 1, date: "2026-08-29", startTime: "16:00", endTime: "18:00" },
    { id: 2, date: "2026-08-30", startTime: "17:00", endTime: "19:00" },
  ]);

  const handleOpenForm = () => {
    setEditingId(null);
    setSettingDate("");
    setSettingStartTime("");
    setSettingEndTime("");
    setIsAdding(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSettingDate(item.date);
    setSettingStartTime(item.startTime);
    setSettingEndTime(item.endTime);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!settingDate || !settingStartTime || !settingEndTime) return;

    if (editingId) {
      setAvailableList((prev) =>
        prev.map((item) =>
          item.id === editingId
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

    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setAvailableList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      {!isAdding ? (
        <>
          <div className="section-header-title">보강 가능 시간</div>
          <SettingTable availableList={availableList} onEdit={handleEdit} onDelete={handleDelete} />
          <div className="bottom-action-bar">
            <Button text="+ 가능 시간 추가" color="blue" width={130} onClick={handleOpenForm} />
          </div>
        </>
      ) : (
        <>
          <section className="form-section">
            <h2 className="form-title">{editingId ? "보강 가능 시간 수정" : "보강 가능 시간 추가"}</h2>
            <div className="form-row">
              <div className="form-group">
                <label>날짜</label>
                <input
                  type="date"
                  value={settingDate}
                  onChange={(e) => setSettingDate(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>시작 시간</label>
                <input
                  type="time"
                  value={settingStartTime}
                  onChange={(e) => setSettingStartTime(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>종료 시간</label>
                <input
                  type="time"
                  value={settingEndTime}
                  onChange={(e) => setSettingEndTime(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-submit">
                <Button text={editingId ? "수정" : "저장"} color="blue" width={90} onClick={handleSave} />
              </div>
            </div>
          </section>

          <section className="list-section">
            <h2 className="section-title">등록된 가능 시간</h2>
            <SettingTable availableList={availableList} onEdit={handleEdit} onDelete={handleDelete} />
          </section>
        </>
      )}
    </>
  );
}