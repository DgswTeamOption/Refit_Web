import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  getClassSchedules,
  getMakeupAvailabilities,
  createMakeupAvailability,
  updateMakeupAvailability,
  deleteMakeupAvailability,
} from "../../../../api/overviewApi";

const DAY_NAMES_KO = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function normalizeValidId(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return "";
  return str;
}

function parseLocalDateAndTime(rawDateTime) {
  if (!rawDateTime) return { date: "", time: "" };
  const str = String(rawDateTime).trim();
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) {
    const dt = new Date(str);
    if (!Number.isNaN(dt.getTime())) {
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      const hh = String(dt.getHours()).padStart(2, "0");
      const min = String(dt.getMinutes()).padStart(2, "0");
      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
    }
  }
  const dMatch = str.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  const tMatch = str.match(/(\d{1,2}:\d{2})/);
  return {
    date: dMatch
      ? `${dMatch[1]}-${dMatch[2].padStart(2, "0")}-${dMatch[3].padStart(2, "0")}`
      : "",
    time: tMatch
      ? `${tMatch[1].split(":")[0].padStart(2, "0")}:${tMatch[1].split(":")[1]}`
      : "",
  };
}

function getKoreanDayFromDate(dateStr) {
  if (!dateStr || !dateStr.includes("-")) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return DAY_NAMES_KO[dt.getDay()] || "";
}

function mapScheduleOption(item, index) {
  const scheduleId = item?.scheduleId ?? item?.schedule_id ?? item?.id ?? index;
  const studentName =
    item?.studentName ??
    item?.student_name ??
    item?.name ??
    item?.student?.name ??
    "학생";
  const rawStart = item?.start_time ?? item?.startTime;
  const { date, time } = parseLocalDateAndTime(rawStart);
  const dayLabel = getKoreanDayFromDate(date);

  return {
    scheduleId,
    label: `${studentName}${dayLabel ? ` (${dayLabel}` : ""}${
      time ? ` ${time})` : dayLabel ? ")" : ""
    }`,
  };
}

function mapAvailabilityItem(item, index) {
  const rawMakeup =
    item?.makeup_time ??
    item?.makeupTime ??
    item?.start_time ??
    item?.startTime;
  const { date, time } = parseLocalDateAndTime(rawMakeup);

  return {
    id:
      item?.id ??
      item?.availabilityId ??
      item?.availability_id ??
      item?.makeupAvailabilityId ??
      index,
    scheduleId: item?.schedule_id ?? item?.scheduleId ?? null,
    capacity: item?.capacity ?? 1,
    date,
    startTime: time,
    endTime: item?.capacity ? `정원 ${item.capacity}명` : "-",
  };
}

function SettingTable({ availableList, loading, error, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="setting-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>시작 시간</th>
            <th>정원</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>보강 가능 시간을 불러오는 중입니다.</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4}>{error}</td>
            </tr>
          ) : availableList.length === 0 ? (
            <tr>
              <td colSpan={4}>등록된 보강 가능 시간이 없습니다.</td>
            </tr>
          ) : (
            availableList.map((item) => (
              <tr key={item.id}>
                <td>{item.date || "-"}</td>
                <td>{item.startTime || "-"}</td>
                <td>{item.endTime || "-"}</td>
                <td>
                  <div className="action-buttons">
                    <Button text="수정" color="lightGray" width={60} onClick={() => onEdit(item)} />
                    <Button text="삭제" color="red" width={60} onClick={() => onDelete(item.id)} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function MakeupSettingTab({ classId, classroomId }) {
  const params = useParams();
  const resolvedClassId =
    normalizeValidId(classId) ||
    normalizeValidId(classroomId) ||
    normalizeValidId(params.classId ?? params.classroomId ?? params.id);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [settingDate, setSettingDate] = useState("");
  const [settingStartTime, setSettingStartTime] = useState("");
  const [settingCapacity, setSettingCapacity] = useState(1);

  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [availableList, setAvailableList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAvailabilities = useCallback(async () => {
    if (!resolvedClassId) {
      setAvailableList([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const scheduleRes = await getClassSchedules(resolvedClassId);
      const rawSchedules = Array.isArray(scheduleRes)
        ? scheduleRes
        : scheduleRes?.schedules || scheduleRes?.content || scheduleRes?.items || [];

      const mappedSchedules = rawSchedules.map(mapScheduleOption);
      setScheduleOptions(mappedSchedules);

      if (mappedSchedules.length === 0) {
        setAvailableList([]);
        setError("등록된 수업 일정이 없습니다. 먼저 '스케줄 관리' 탭에서 수업 일정을 등록해주세요.");
        return;
      }

      setSelectedScheduleId((prev) => prev || String(mappedSchedules[0].scheduleId));

      const results = await Promise.allSettled(
        mappedSchedules.map((s) =>
          getMakeupAvailabilities({ schedule_id: s.scheduleId })
        )
      );

      const merged = [];
      const seenIds = new Set();

      results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const val = result.value;
        const list = Array.isArray(val)
          ? val
          : val?.availabilities || val?.content || val?.items || val?.list || [];
        list.map(mapAvailabilityItem).forEach((mappedItem) => {
          if (!seenIds.has(mappedItem.id)) {
            seenIds.add(mappedItem.id);
            merged.push(mappedItem);
          }
        });
      });

      setAvailableList(merged);
    } catch (err) {
      setError(err.message || "보강 가능 시간을 불러오지 못했습니다.");
      setAvailableList([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedClassId]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const handleOpenForm = () => {
    if (scheduleOptions.length === 0) {
      alert("먼저 '스케줄 관리' 탭에서 학생 시간표(수업 일정)를 등록해주세요.");
      return;
    }
    setEditingId(null);
    setSelectedScheduleId(String(scheduleOptions[0].scheduleId));
    setSettingDate("");
    setSettingStartTime("");
    setSettingCapacity(1);
    setIsAdding(true);
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setSettingDate("");
    setSettingStartTime("");
    setSettingCapacity(1);
    setIsAdding(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    if (item.scheduleId) {
      setSelectedScheduleId(String(item.scheduleId));
    }
    setSettingDate(item.date);
    setSettingStartTime(item.startTime);
    setSettingCapacity(item.capacity || 1);
    setIsAdding(true);
  };

  const handleSave = async () => {
    const targetScheduleId = selectedScheduleId || scheduleOptions[0]?.scheduleId;
    if (!targetScheduleId) {
      alert("수업 일정이 없습니다. 먼저 '스케줄 관리' 탭에서 수업 일정을 등록해주세요.");
      return;
    }
    if (!settingDate || !settingStartTime) {
      alert("날짜와 시작 시간을 모두 입력해주세요.");
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      const numericClassId = Number(resolvedClassId);
      const normalizedClassId = Number.isNaN(numericClassId)
        ? resolvedClassId
        : numericClassId;
      const numericScheduleId = Number(targetScheduleId);
      const normalizedScheduleId = Number.isNaN(numericScheduleId)
        ? targetScheduleId
        : numericScheduleId;
      const [hh, mm] = settingStartTime.split(":");
      const makeupDateTime = `${settingDate}T${hh.padStart(2, "0")}:${mm}:00`;
      const normalizedCapacity = Math.max(1, Number(settingCapacity) || 1);

      if (editingId) {
        await updateMakeupAvailability(editingId, {
          capacity: normalizedCapacity,
          class_id: normalizedClassId,
          schedule_id: normalizedScheduleId,
          makeup_time: makeupDateTime,
        });
      } else {
        await createMakeupAvailability({
          capacity: normalizedCapacity,
          class_id: normalizedClassId,
          schedule_id: normalizedScheduleId,
          makeup_time: [makeupDateTime],
        });
      }

      await fetchAvailabilities();
      setEditingId(null);
      setIsAdding(false);
    } catch (err) {
      alert(err.message || "보강 가능 시간 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMakeupAvailability(id);
      setAvailableList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || "보강 가능 시간 삭제에 실패했습니다.");
    }
  };

  return (
    <>
      {!isAdding ? (
        <>
          <div className="section-header-title">보강 가능 시간</div>
          <SettingTable
            availableList={availableList}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="bottom-action-bar">
            <Button text="+ 가능 시간 추가" color="blue" width={130} onClick={handleOpenForm} />
          </div>
        </>
      ) : (
        <>
          <section className="form-section">
            <h2 className="form-title">{editingId ? "보강 가능 시간 수정" : "보강 가능 시간 추가"}</h2>
            <div className="form-row">
              {scheduleOptions.length > 0 && (
                <div className="form-group">
                  <label>수업 일정</label>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    className="form-control"
                  >
                    {scheduleOptions.map((opt) => (
                      <option key={opt.scheduleId} value={opt.scheduleId}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                <label>수용 인원</label>
                <input
                  type="number"
                  min={1}
                  value={settingCapacity}
                  onChange={(e) => setSettingCapacity(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-submit" style={{ display: "flex", gap: "8px" }}>
                <Button text={editingId ? "수정" : "저장"} color="blue" width={90} onClick={handleSave} />
                <Button text="취소" color="lightGray" width={80} onClick={handleCancelForm} />
              </div>
            </div>
          </section>

          <section className="list-section">
            <h2 className="section-title">등록된 가능 시간</h2>
            <SettingTable
              availableList={availableList}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>
        </>
      )}
    </>
  );
}
