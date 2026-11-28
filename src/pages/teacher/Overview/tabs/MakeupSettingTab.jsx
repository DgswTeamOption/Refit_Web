import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  getMakeupAvailabilities,
  createMakeupAvailability,
  updateMakeupAvailability,
  deleteMakeupAvailability,
  getClassSchedules,
  getClassStudents,
} from "../../../../api/overviewApi";

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

function formatKoreanMonthDay(date) {
  if (!date) return "-";
  const match = String(date).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return match ? `${Number(match[2])}월 ${Number(match[3])}일` : date;
}

function extractList(response, keys) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(response[key])) return response[key];
  }
  return [];
}

function getScheduleId(item) {
  return item?.scheduleId ?? item?.schedule_id;
}

function getScheduleOptionLabel(item, studentNames) {
  const studentId = item?.studentId ?? item?.student_id;
  const studentName =
    item?.studentName ??
    item?.student_name ??
    studentNames.get(String(studentId)) ??
    (studentId ? `학생 ${studentId}` : "수업");
  const { date, time } = parseLocalDateAndTime(
    item?.startTime ?? item?.start_time
  );
  const scheduleTime = [date ? formatKoreanMonthDay(date) : "", time]
    .filter(Boolean)
    .join(" ");
  return scheduleTime ? `${studentName} · ${scheduleTime}` : studentName;
}

function mapScheduleOptions(response, studentsResponse) {
  const students = extractList(studentsResponse, [
    "students",
    "members",
    "content",
    "items",
    "list",
  ]);
  const studentNames = new Map(
    students.map((student) => [
      String(student?.studentId ?? student?.student_id ?? student?.id),
      student?.name ?? student?.studentName ?? student?.student_name ?? "학생",
    ])
  );
  const uniqueSchedules = new Map();

  extractList(response, ["schedules", "content", "items", "list"]).forEach(
    (item) => {
      const scheduleId = getScheduleId(item);
      if (
        scheduleId === undefined ||
        scheduleId === null ||
        String(scheduleId).trim() === ""
      ) {
        return;
      }
      const key = String(scheduleId);
      if (!uniqueSchedules.has(key)) {
        const studentId = item?.studentId ?? item?.student_id;
        const studentName =
          item?.studentName ??
          item?.student_name ??
          studentNames.get(String(studentId)) ??
          (studentId ? `학생 ${studentId}` : "수업");
        const { date, time } = parseLocalDateAndTime(
          item?.startTime ?? item?.start_time
        );
        const label = getScheduleOptionLabel(item, studentNames);
        uniqueSchedules.set(key, {
          id: key,
          label,
          searchText: [label, studentName, date, time, formatKoreanMonthDay(date)]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("ko-KR"),
        });
      }
    }
  );

  return Array.from(uniqueSchedules.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "ko")
  );
}

function mapAvailabilityItem(item, index, scheduleLabels) {
  const { date, time } = parseLocalDateAndTime(item?.makeup_time ?? item?.makeupTime);
  const scheduleId = item?.schedule_id ?? item?.scheduleId;
  return {
    id:
      item?.id ??
      item?.availabilityId ??
      item?.availability_id ??
      item?.makeupAvailabilityId ??
      index,
    scheduleId:
      scheduleId === undefined || scheduleId === null ? "" : String(scheduleId),
    scheduleLabel:
      scheduleLabels.get(String(scheduleId)) ||
      (scheduleId ? `수업 일정 ${scheduleId}` : "-"),
    date,
    startTime: time,
    capacity: item?.capacity ?? 1,
    minCapacity: item?.min_capacity ?? item?.minCapacity ?? 1,
    canChangeTime: item?.can_change_time ?? item?.canChangeTime ?? true,
    canDelete: item?.can_delete ?? item?.canDelete ?? true,
    lockReason: item?.lock_reason ?? item?.lockReason ?? "",
  };
}

function SettingTable({ availableList, loading, error, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="setting-table">
        <thead>
          <tr>
            <th>수업 일정</th>
            <th>보강 시간</th>
            <th>수용 인원</th>
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
                <td>{item.scheduleLabel}</td>
                <td>
                  {[item.date ? formatKoreanMonthDay(item.date) : "", item.startTime]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </td>
                <td>{item.capacity}명</td>
                <td>
                  <div className="action-buttons">
                    <Button
                      text="수정"
                      color="lightGray"
                      width={60}
                      disabled={!item.canChangeTime}
                      onClick={() => onEdit(item)}
                    />
                    <Button
                      text="삭제"
                      color="red"
                      width={60}
                      disabled={!item.canDelete}
                      onClick={() => onDelete(item.id)}
                    />
                  </div>
                  {item.lockReason && !item.canChangeTime && (
                    <small>{item.lockReason}</small>
                  )}
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

  const [editingId, setEditingId] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const [settingDateTime, setSettingDateTime] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [saveMessage, setSaveMessage] = useState("");

  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [availableList, setAvailableList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAvailabilities = useCallback(async () => {
    if (!resolvedClassId) {
      setAvailableList([]);
      setScheduleOptions([]);
      return;
    }

    setLoading(true);
    setError("");
    setScheduleError("");
    try {
      const classIdNumber = Number(resolvedClassId);
      const normalizedClassId = Number.isNaN(classIdNumber)
        ? resolvedClassId
        : classIdNumber;
      const [availabilityResult, schedulesResult, studentsResult] =
        await Promise.allSettled([
          getMakeupAvailabilities({ class_id: normalizedClassId }),
          getClassSchedules(normalizedClassId),
          getClassStudents(normalizedClassId),
        ]);

      let mappedSchedules = [];
      if (schedulesResult.status === "fulfilled") {
        mappedSchedules = mapScheduleOptions(
          schedulesResult.value,
          studentsResult.status === "fulfilled" ? studentsResult.value : []
        );
        setScheduleOptions(mappedSchedules);
      } else {
        setScheduleOptions([]);
        setScheduleError(schedulesResult.reason?.message || "수업 일정을 불러오지 못했습니다.");
      }

      if (availabilityResult.status === "fulfilled") {
        const list = extractList(availabilityResult.value, [
          "availabilities",
          "content",
          "items",
          "list",
        ]);
        const scheduleLabels = new Map(mappedSchedules.map((item) => [item.id, item.label]));
        setAvailableList(
          list.map((item, index) => mapAvailabilityItem(item, index, scheduleLabels))
        );
      } else {
        setError(availabilityResult.reason?.message || "보강 가능 시간을 불러오지 못했습니다.");
        setAvailableList([]);
      }
    } finally {
      setLoading(false);
    }
  }, [resolvedClassId]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const handleCancelForm = () => {
    setEditingId(null);
    setSelectedScheduleId("");
    setScheduleSearch("");
    setSchedulePickerOpen(false);
    setSettingDateTime("");
    setCapacity(1);
    setSaveMessage("");
  };

  const handleEdit = (item) => {
    if (!item.canChangeTime || submitting) return;
    setEditingId(item.id);
    setSelectedScheduleId(item.scheduleId);
    const schedule = scheduleOptions.find((option) => option.id === item.scheduleId);
    setScheduleSearch(schedule?.label || item.scheduleLabel || "");
    setSchedulePickerOpen(false);
    setSettingDateTime(
      item.date && item.startTime ? `${item.date}T${item.startTime}` : ""
    );
    setCapacity(
      Math.max(Number(item.minCapacity) || 1, Number(item.capacity) || 1)
    );
    setSaveMessage("");
  };

  const handleSave = async () => {
    if (submitting) return;
    if (editingId !== null && !editingItem?.canChangeTime) {
      setSaveMessage(editingItem?.lockReason || "이 보강 가능 시간을 수정할 수 없습니다.");
      return;
    }
    setSaveMessage("");
    const scheduleIdNumber = Number(selectedScheduleId);
    if (
      editingId === null &&
      (!Number.isInteger(scheduleIdNumber) || scheduleIdNumber < 1)
    ) {
      setSaveMessage("연결할 수업 일정을 선택해주세요.");
      return;
    }
    const minCapacity =
      editingId !== null
        ? Number(
            availableList.find((item) => item.id === editingId)?.minCapacity
          ) || 1
        : 1;
    const [makeupDate, makeupTimeValue] = settingDateTime.split("T");
    if (
      !makeupDate ||
      !makeupTimeValue ||
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) < minCapacity
    ) {
      setSaveMessage(`보강 날짜와 시간을 입력하고 수용 인원을 ${minCapacity}명 이상으로 설정해주세요.`);
      return;
    }

    const normalizedClassId = Number(resolvedClassId);
    if (!Number.isInteger(normalizedClassId) || normalizedClassId < 1) {
      setSaveMessage("수업 정보를 확인할 수 없습니다. 페이지를 새로고침해주세요.");
      return;
    }
    const makeupTime = `${settingDateTime}:00`;
    const payload = {
      capacity: Number(capacity),
      makeup_time: makeupTime,
    };

    setSubmitting(true);
    try {
      if (editingId !== null) {
        await updateMakeupAvailability(editingId, payload);
      } else {
        await createMakeupAvailability({
          ...payload,
          class_id: normalizedClassId,
          schedule_id: scheduleIdNumber,
          makeup_time: [makeupTime],
        });
      }
      await fetchAvailabilities();
      handleCancelForm();
    } catch (err) {
      setSaveMessage(err.message || "보강 가능 시간 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const editingItem = availableList.find((item) => item.id === editingId);
  const scheduleSearchTokens = scheduleSearch
    .trim()
    .toLocaleLowerCase("ko-KR")
    .split(/[\s,·]+/)
    .filter(Boolean);
  const filteredScheduleOptions = scheduleSearchTokens.length
    ? scheduleOptions.filter((item) =>
        scheduleSearchTokens.every((token) => item.searchText.includes(token))
      )
    : [];
  const [makeupDateValue = "", makeupTimeValue = ""] = settingDateTime.split("T");

  const updateMakeupDateTime = (part, value) => {
    const [date = "", time = ""] = settingDateTime.split("T");
    setSettingDateTime(part === "date" ? `${value}T${time}` : `${date}T${value}`);
    setSaveMessage("");
  };

  const handleDelete = async (id) => {
    if (!availableList.find((item) => item.id === id)?.canDelete) return;
    setActionError("");
    try {
      await deleteMakeupAvailability(id);
      setAvailableList((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) handleCancelForm();
    } catch (err) {
      setActionError(err.message || "보강 가능 시간 삭제에 실패했습니다.");
    }
  };

  return (
    <>
      <section className="form-section">
        <h2 className="form-title">
          {editingId !== null ? "보강 가능 시간 수정" : "보강 가능 시간 등록"}
        </h2>
        <div className="form-row makeup-setting-form-row">
          <div className="form-group makeup-schedule-group">
            <label htmlFor="makeup-schedule-search">수업 일정</label>
            <div
              className="makeup-autocomplete"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setSchedulePickerOpen(false);
                }
              }}
            >
              <input
                id="makeup-schedule-search"
                type="search"
                autoComplete="off"
                className="form-control"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={schedulePickerOpen && Boolean(scheduleSearch.trim())}
                aria-controls="makeup-schedule-options"
                value={scheduleSearch}
                disabled={editingId !== null || scheduleOptions.length === 0}
                onFocus={() => setSchedulePickerOpen(true)}
                onChange={(event) => {
                  setScheduleSearch(event.target.value);
                  setSelectedScheduleId("");
                  setSchedulePickerOpen(true);
                  setSaveMessage("");
                }}
                placeholder={scheduleOptions.length ? "예: 김민지, 11월 25일 18:38" : "등록된 수업 일정 없음"}
              />
              {schedulePickerOpen && scheduleSearch.trim() && editingId === null && scheduleOptions.length > 0 && (
                <div id="makeup-schedule-options" className="makeup-autocomplete-options" role="listbox">
                  {filteredScheduleOptions.length ? filteredScheduleOptions.slice(0, 30).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={selectedScheduleId === item.id}
                      className="makeup-autocomplete-option"
                      onClick={() => {
                        setSelectedScheduleId(item.id);
                        setScheduleSearch(item.label);
                        setSchedulePickerOpen(false);
                        setSaveMessage("");
                      }}
                    >
                      {item.label}
                    </button>
                  )) : (
                    <div className="makeup-autocomplete-empty">일치하는 수업 일정이 없습니다.</div>
                  )}
                  {filteredScheduleOptions.length > 30 && (
                    <div className="makeup-autocomplete-empty">검색어를 더 입력하면 결과를 좁힐 수 있습니다.</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="form-group makeup-datetime-group">
            <label>보강 날짜와 시간</label>
            <div className="makeup-datetime-fields">
              <input
                type="date"
                aria-label="보강 날짜"
                value={makeupDateValue}
                className="form-control makeup-date-control"
                disabled={editingId !== null && editingItem?.canChangeTime === false}
                onChange={(e) => updateMakeupDateTime("date", e.target.value)}
              />
              <input
                type="time"
                aria-label="보강 시간"
                value={makeupTimeValue}
                className="form-control makeup-time-control"
                disabled={editingId !== null && editingItem?.canChangeTime === false}
                onChange={(e) => updateMakeupDateTime("time", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group makeup-capacity-group">
            <label>수용 인원</label>
            <input
              type="number"
              min={editingId !== null ? editingItem?.minCapacity || 1 : 1}
              step="1"
              value={capacity}
              onChange={(e) => {
                setCapacity(e.target.value);
                setSaveMessage("");
              }}
              className="form-control"
            />
          </div>
          <div className="form-submit" style={{ display: "flex", gap: "8px" }}>
            <Button
              text={submitting ? "저장 중" : editingId !== null ? "수정" : "저장"}
              color="blue"
              width={90}
              disabled={submitting || (editingId === null
                ? !selectedScheduleId || scheduleOptions.length === 0
                : !editingItem?.canChangeTime)}
              onClick={handleSave}
            />
            {editingId !== null && (
              <Button text="취소" color="lightGray" width={80} onClick={handleCancelForm} />
            )}
          </div>
        </div>
        {scheduleError && (
          <p role="alert" className="makeup-setting-notice">
            {scheduleError}
          </p>
        )}
        {!scheduleError && scheduleOptions.length === 0 && (
          <p className="makeup-setting-notice">
            연결할 수업 일정이 없습니다. 먼저 스케줄 관리 탭에서 일정을 등록해주세요.
          </p>
        )}
        {saveMessage && (
          <p role="alert" className="makeup-setting-notice">
            {saveMessage}
          </p>
        )}
      </section>

      <section className="list-section">
        <h2 className="section-title">등록된 보강 가능 시간</h2>
        {actionError && (
          <p role="alert" className="makeup-setting-notice">
            {actionError}
          </p>
        )}
        <SettingTable
          availableList={availableList}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </>
  );
}
