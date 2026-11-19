import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  getMakeupAvailabilities,
  createMakeupAvailability,
  updateMakeupAvailability,
  deleteMakeupAvailability,
} from "../../../../api/overviewApi.js";

function parseAvailabilityItem(item) {
  const dateObj = new Date(item.makeup_time);
  if (Number.isNaN(dateObj.getTime())) {
    return {
      id: item.id,
      date: "",
      startTime: "",
      endTime: "",
      capacity: item.capacity ?? 1,
    };
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const startHour = String(dateObj.getHours()).padStart(2, "0");
  const startMinute = String(dateObj.getMinutes()).padStart(2, "0");

  const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
  const endHour = String(endDateObj.getHours()).padStart(2, "0");
  const endMinute = String(endDateObj.getMinutes()).padStart(2, "0");

  return {
    id: item.id,
    date: `${year}-${month}-${day}`,
    startTime: `${startHour}:${startMinute}`,
    endTime: `${endHour}:${endMinute}`,
    capacity: item.capacity ?? 1,
  };
}

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
                  <Button
                    text="수정"
                    color="lightGray"
                    width={60}
                    onClick={() => onEdit(item)}
                  />
                  <Button
                    text="삭제"
                    color="red"
                    width={60}
                    onClick={() => onDelete(item.id)}
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

export default function MakeupSettingTab({ classId, classroomId }) {
  const params = useParams();
  const activeClassId =
    classId ?? classroomId ?? params.classroomId ?? params.classId ?? params.id;

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [settingDate, setSettingDate] = useState("");
  const [settingStartTime, setSettingStartTime] = useState("");
  const [settingEndTime, setSettingEndTime] = useState("");
  const [availableList, setAvailableList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailabilities = useCallback(async () => {
    if (!activeClassId) return;
    try {
      const data = await getMakeupAvailabilities({ class_id: activeClassId });
      const list = Array.isArray(data) ? data : [];
      setAvailableList(list.map(parseAvailabilityItem));
    } catch (error) {
      console.error("보강 가능 시간 조회 실패:", error);
    }
  }, [activeClassId]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

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

  const handleSave = async () => {
    if (!settingDate || !settingStartTime || !settingEndTime || isSubmitting) return;

    const isoStartTime = new Date(`${settingDate}T${settingStartTime}:00`).toISOString();

    try {
      setIsSubmitting(true);
      if (editingId) {
        const target = availableList.find((item) => item.id === editingId);
        await updateMakeupAvailability(editingId, {
          capacity: target?.capacity ?? 1,
          makeup_time: isoStartTime,
        });
      } else {
        await createMakeupAvailability({
          capacity: 1,
          capacityOrDefault: 1,
          class_id: Number(activeClassId),
          makeup_time: [isoStartTime],
        });
      }

      await fetchAvailabilities();
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      alert(error.message || "보강 가능 시간 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await deleteMakeupAvailability(id);
      setAvailableList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error.message || "보강 가능 시간 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!isAdding ? (
        <>
          <div className="section-header-title">보강 가능 시간</div>
          <SettingTable
            availableList={availableList}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="bottom-action-bar">
            <Button
              text="+ 가능 시간 추가"
              color="blue"
              width={130}
              onClick={handleOpenForm}
            />
          </div>
        </>
      ) : (
        <>
          <section className="form-section">
            <h2 className="form-title">
              {editingId ? "보강 가능 시간 수정" : "보강 가능 시간 추가"}
            </h2>
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
                <Button
                  text={editingId ? "수정" : "저장"}
                  color="blue"
                  width={90}
                  onClick={handleSave}
                />
              </div>
            </div>
          </section>

          <section className="list-section">
            <h2 className="section-title">등록된 가능 시간</h2>
            <SettingTable
              availableList={availableList}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>
        </>
      )}
    </>
  );
}