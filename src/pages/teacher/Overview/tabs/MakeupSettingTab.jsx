import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  getMakeupAvailabilities,
  createMakeupAvailability,
  updateMakeupAvailability,
  deleteMakeupAvailability,
  getClassSchedules,
  getClassStudents,
} from "../../../../api/overviewApi.js";

function parseServerDate(dateTimeStr) {
  if (!dateTimeStr) return new Date(NaN);
  return new Date(String(dateTimeStr).replace(" ", "T"));
}

function parseAvailabilityItem(item) {
  const dateObj = parseServerDate(item.makeup_time);
  if (Number.isNaN(dateObj.getTime())) {
    return {
      id: item.id,
      scheduleId: item.schedule_id ?? "",
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
    scheduleId: item.schedule_id ?? "",
    date: `${year}-${month}-${day}`,
    startTime: `${startHour}:${startMinute}`,
    endTime: `${endHour}:${endMinute}`,
    capacity: item.capacity ?? 1,
  };
}

function SettingTable({ availableList, scheduleLabelMap, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="setting-table">
        <thead>
          <tr>
            <th>대상 수업 일정</th>
            <th>보강 날짜</th>
            <th>시작 시간</th>
            <th>종료 시간 (1시간 단위)</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {availableList.map((item) => (
            <tr key={item.id}>
              <td>
                {scheduleLabelMap.get(Number(item.scheduleId)) ||
                  (item.scheduleId ? `일정 #${item.scheduleId}` : "—")}
              </td>
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
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [settingDate, setSettingDate] = useState("");
  const [settingStartTime, setSettingStartTime] = useState("");
  const [availableList, setAvailableList] = useState([]);
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scheduleLabelMap = useMemo(() => {
    const map = new Map();
    scheduleOptions.forEach((opt) => {
      map.set(Number(opt.scheduleId), opt.label);
    });
    return map;
  }, [scheduleOptions]);

  const fetchData = useCallback(async () => {
    if (!activeClassId) return;
    try {
      const [availData, schedulesData, studentsData] = await Promise.all([
        getMakeupAvailabilities({ class_id: activeClassId }),
        getClassSchedules(activeClassId).catch(() => []),
        getClassStudents(activeClassId).catch(() => []),
      ]);

      const studentNameMap = new Map();
      (Array.isArray(studentsData) ? studentsData : []).forEach((s) => {
        studentNameMap.set(s.studentId, s.name);
      });

      const parsedSchedules = (Array.isArray(schedulesData) ? schedulesData : [])
        .map((sch) => {
          const d = parseServerDate(sch.startTime);
          const id = sch.scheduleId ?? sch.id;
          const studentName =
            studentNameMap.get(sch.studentId) || `학생 ${sch.studentId}`;
          if (Number.isNaN(d.getTime())) {
            return { scheduleId: id, label: `${studentName} (일정 #${id})` };
          }
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const hh = String(d.getHours()).padStart(2, "0");
          const min = String(d.getMinutes()).padStart(2, "0");
          return {
            scheduleId: id,
            label: `${studentName} - ${mm}/${dd} ${hh}:${min}`,
          };
        });

      setScheduleOptions(parsedSchedules);

      const list = Array.isArray(availData) ? availData : [];
      setAvailableList(list.map(parseAvailabilityItem));
    } catch (error) {
      console.error("보강 가능 시간 조회 실패:", error);
    }
  }, [activeClassId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = () => {
    setEditingId(null);
    setSelectedScheduleId(
      scheduleOptions.length > 0 ? String(scheduleOptions[0].scheduleId) : ""
    );
    setSettingDate("");
    setSettingStartTime("");
    setIsAdding(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSelectedScheduleId(item.scheduleId ? String(item.scheduleId) : "");
    setSettingDate(item.date);
    setSettingStartTime(item.startTime);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!settingDate || !settingStartTime) {
      alert("보강 날짜와 시작 시간을 모두 입력해주세요.");
      return;
    }
    if (!editingId && !selectedScheduleId) {
      alert("원래 수업 일정을 선택해주세요.");
      return;
    }

    const localMakeupTime = `${settingDate}T${settingStartTime}:00`;

    try {
      setIsSubmitting(true);
      if (editingId) {
        const target = availableList.find((item) => item.id === editingId);
        await updateMakeupAvailability(editingId, {
          capacity: target?.capacity ?? 1,
          makeup_time: localMakeupTime,
        });
      } else {
        await createMakeupAvailability({
          capacity: 1,
          class_id: Number(activeClassId),
          schedule_id: Number(selectedScheduleId),
          makeup_time: [localMakeupTime],
        });
      }

      await fetchData();
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
            scheduleLabelMap={scheduleLabelMap}
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
              {!editingId && (
                <div className="form-group">
                  <label>원래 수업 일정</label>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    className="form-control"
                  >
                    <option value="">수업 일정 선택</option>
                    {scheduleOptions.map((opt) => (
                      <option key={opt.scheduleId} value={opt.scheduleId}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>보강 날짜</label>
                <input
                  type="date"
                  value={settingDate}
                  onChange={(e) => setSettingDate(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>시작 시간 (1시간 단위)</label>
                <input
                  type="time"
                  value={settingStartTime}
                  onChange={(e) => setSettingStartTime(e.target.value)}
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
              scheduleLabelMap={scheduleLabelMap}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>
        </>
      )}
    </>
  );
}