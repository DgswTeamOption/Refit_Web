import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  getClassScheduleRules,
  createClassScheduleRule,
  updateClassScheduleRule,
  deleteClassScheduleRule,
  getClassStudents,
  getClassAbsences,
  getClassMakeups,
} from "../../../../api/overviewApi";

const DAYS_OPTIONS = [
  { label: "월", fullLabel: "월요일", key: "mon", apiDay: "MON", fullApiDay: "MONDAY", dayNum: 1 },
  { label: "화", fullLabel: "화요일", key: "tue", apiDay: "TUE", fullApiDay: "TUESDAY", dayNum: 2 },
  { label: "수", fullLabel: "수요일", key: "wed", apiDay: "WED", fullApiDay: "WEDNESDAY", dayNum: 3 },
  { label: "목", fullLabel: "목요일", key: "thu", apiDay: "THU", fullApiDay: "THURSDAY", dayNum: 4 },
  { label: "금", fullLabel: "금요일", key: "fri", apiDay: "FRI", fullApiDay: "FRIDAY", dayNum: 5 },
  { label: "토", fullLabel: "토요일", key: "sat", apiDay: "SAT", fullApiDay: "SATURDAY", dayNum: 6 },
  { label: "일", fullLabel: "일요일", key: "sun", apiDay: "SUN", fullApiDay: "SUNDAY", dayNum: 0 },
];

const SCHEDULE_STYLES = `
  .form-section .schedule-top-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
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
    align-items: center;
    gap: 6px;
  }

  .form-section .time-input-box {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 114px;
    height: 42px;
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

function normalizeValidId(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return "";
  return str;
}

function toNumericId(value) {
  const str = normalizeValidId(value);
  if (!str) return null;
  const num = Number(str);
  return Number.isNaN(num) ? null : num;
}

function normalizeTimeValue(rawTime) {
  if (!rawTime || rawTime === "—") return "";
  const str = String(rawTime).trim();
  const match = str.match(/(\d{1,2}:\d{2})/);
  if (match) {
    const [hour, minute] = match[1].split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  }
  return "";
}

function addOneHour(startTime) {
  if (!startTime || !startTime.includes(":")) return "";
  const [hStr, mStr] = startTime.split(":");
  const nextHour = (Number(hStr) + 1) % 24;
  return `${String(nextHour).padStart(2, "0")}:${mStr}`;
}

function parseDateTimeToLocalParts(rawDateTime) {
  if (!rawDateTime) return { dayKey: "", time: "" };
  const str = String(rawDateTime).trim();
  const parsedDate = new Date(str);
  if (!Number.isNaN(parsedDate.getTime())) {
    const foundDay = DAYS_OPTIONS.find((day) => day.dayNum === parsedDate.getDay());
    return {
      dayKey: foundDay?.key || "",
      time: `${String(parsedDate.getHours()).padStart(2, "0")}:${String(
        parsedDate.getMinutes()
      ).padStart(2, "0")}`,
    };
  }
  const dateMatch = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  let dayKey = "";
  if (dateMatch) {
    const dt = new Date(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3])
    );
    const foundDay = DAYS_OPTIONS.find((d) => d.dayNum === dt.getDay());
    dayKey = foundDay ? foundDay.key : "";
  }
  return {
    dayKey,
    time: normalizeTimeValue(str),
  };
}

function formatDisplayCell(slot) {
  if (!slot || !slot.startTime) return "—";
  return slot.startTime;
}

function resolveDayKey(rawDay) {
  if (rawDay === undefined || rawDay === null) return "";
  const str = String(rawDay).trim().toUpperCase();
  const found = DAYS_OPTIONS.find(
    (d) =>
      d.key.toUpperCase() === str ||
      d.apiDay === str ||
      d.fullApiDay === str ||
      d.label === str ||
      d.fullLabel === str ||
      String(d.dayNum) === str ||
      (d.key === "sun" && str === "7")
  );
  return found ? found.key : "";
}

function extractStudentName(item) {
  if (!item || typeof item !== "object") return "-";
  return (
    item.studentName ??
    item.student_name ??
    item.userName ??
    item.user_name ??
    item.memberName ??
    item.member_name ??
    item.nickname ??
    item.name ??
    item.student?.name ??
    item.student?.studentName ??
    item.user?.name ??
    item.member?.name ??
    "-"
  );
}

function extractExplicitStudentId(item) {
  if (!item || typeof item !== "object") return null;
  return (
    item.studentId ??
    item.student_id ??
    item.userId ??
    item.user_id ??
    item.memberId ??
    item.member_id ??
    item.student?.id ??
    item.student?.studentId ??
    item.user?.id ??
    item.member?.id ??
    null
  );
}

function extractStudentId(item) {
  if (!item || typeof item !== "object") return null;
  return extractExplicitStudentId(item) ?? item.id ?? null;
}

function extractArray(res, keys) {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(res[key])) return res[key];
  }
  return [];
}

function mapScheduleList(rawList, studentOptions = []) {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  const studentNames = new Map(
    studentOptions.map((student) => [String(student.id), student.name])
  );
  const groupedMap = new Map();

  rawList.forEach((item, index) => {
    const studentId = extractExplicitStudentId(item);
    const responseStudentName = extractStudentName(item);
    const studentName =
      responseStudentName !== "-"
        ? responseStudentName
        : studentNames.get(String(studentId)) || "-";
    const ruleId = item?.ruleId ?? item?.rule_id ?? item?.id ?? index;

    const groupKey = studentId !== null ? `id-${studentId}` : `name-${studentName}`;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        id: ruleId,
        studentId,
        studentName,
        slots: {},
        ruleIds: [],
      });
    }

    const existing = groupedMap.get(groupKey);
    const rawStart = item?.start_time ?? item?.startTime ?? item?.time;
    const rawEnd = item?.end_time ?? item?.endTime;
    const parsedStart = parseDateTimeToLocalParts(rawStart);
    const parsedEnd = parseDateTimeToLocalParts(rawEnd);

    const dayKey =
      resolveDayKey(
        item?.dayOfWeek ?? item?.day_of_week ?? item?.day ?? item?.weekday
      ) || parsedStart.dayKey;

    const startTime = parsedStart.time || normalizeTimeValue(rawStart);
    const endTime = parsedEnd.time || normalizeTimeValue(rawEnd);

    if (dayKey && startTime) {
      existing.slots[dayKey] = {
        ruleId,
        startTime,
        endTime: endTime || addOneHour(startTime),
      };
    }

    if (ruleId !== undefined && ruleId !== null) {
      existing.ruleIds.push(ruleId);
    }
  });

  return Array.from(groupedMap.values());
}

function ScheduleTable({ scheduleList, loading, error, onEdit, onDelete }) {
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
          {loading ? (
            <tr>
              <td colSpan={9}>시간표를 불러오는 중입니다.</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={9}>{error}</td>
            </tr>
          ) : scheduleList.length === 0 ? (
            <tr>
              <td colSpan={9}>등록된 시간표가 없습니다.</td>
            </tr>
          ) : (
            scheduleList.map((item) => (
              <tr key={item.id}>
                <td>{item.studentName}</td>
                {DAYS_OPTIONS.map((d) => (
                  <td key={d.key}>{formatDisplayCell(item.slots?.[d.key])}</td>
                ))}
                <td>
                  <div className="action-buttons">
                    <Button text="수정" color="lightGray" width={60} onClick={() => onEdit(item)} />
                    <Button text="삭제" color="red" width={60} onClick={() => onDelete(item)} />
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

export default function ScheduleTab({ classId, classroomId }) {
  const params = useParams();
  const resolvedClassId =
    normalizeValidId(classId) ||
    normalizeValidId(classroomId) ||
    normalizeValidId(params.classId ?? params.classroomId ?? params.id);

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [scheduleStudent, setScheduleStudent] = useState("");
  const [daySchedules, setDaySchedules] = useState({});

  const [scheduleList, setScheduleList] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = useCallback(async () => {
    if (!resolvedClassId) {
      setScheduleList([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await getClassScheduleRules(resolvedClassId);
      const list = extractArray(res, ["rules", "content", "items", "list"]);
      setScheduleList(mapScheduleList(list, studentOptions));
    } catch (err) {
      const message = err.message || "시간표를 불러오지 못했습니다.";
      setError(err.status ? `${message} (HTTP ${err.status})` : message);
      setScheduleList([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedClassId, studentOptions]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    if (!resolvedClassId) return;
    let isMounted = true;

    Promise.allSettled([
      getClassStudents(resolvedClassId),
      getClassAbsences(resolvedClassId),
      getClassMakeups(resolvedClassId),
    ]).then(([studentsRes, absencesRes, makeupsRes]) => {
      if (!isMounted) return;

      const optionsMap = new Map();

      if (studentsRes.status === "fulfilled") {
        const list = extractArray(studentsRes.value, [
          "students",
          "members",
          "content",
          "items",
          "list",
        ]);
        list.forEach((s) => {
          const id = extractStudentId(s);
          const name = extractStudentName(s);
          if (id !== null && id !== undefined && name && name !== "-") {
            optionsMap.set(String(id), { id, name: String(name).trim() });
          }
        });
      }

      [absencesRes, makeupsRes].forEach((res) => {
        if (res.status !== "fulfilled") return;
        const list = extractArray(res.value, [
          "absences",
          "makeups",
          "content",
          "items",
          "list",
        ]);
        list.forEach((row) => {
          const id = extractExplicitStudentId(row);
          const name = extractStudentName(row);
          if (
            id !== null &&
            id !== undefined &&
            name &&
            name !== "-" &&
            !optionsMap.has(String(id))
          ) {
            optionsMap.set(String(id), { id, name: String(name).trim() });
          }
        });
      });

      setStudentOptions(Array.from(optionsMap.values()));
    });

    return () => {
      isMounted = false;
    };
  }, [resolvedClassId]);

  const toggleDaySelection = (dayKey) => {
    setDaySchedules((current) => {
      if (Object.prototype.hasOwnProperty.call(current, dayKey)) {
        const next = { ...current };
        delete next[dayKey];
        return next;
      }
      return { ...current, [dayKey]: "" };
    });
  };

  const handleOpenForm = () => {
    setEditingItem(null);
    setSelectedStudentId(studentOptions[0] ? String(studentOptions[0].id) : "");
    setScheduleStudent(studentOptions[0] ? studentOptions[0].name : "");
    setDaySchedules({});
    setIsAdding(true);
  };

  const handleCancelForm = () => {
    setEditingItem(null);
    setSelectedStudentId("");
    setScheduleStudent("");
    setDaySchedules({});
    setIsAdding(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setScheduleStudent(item.studentName);
    const matched = studentOptions.find(
      (opt) =>
        (item.studentId !== null && String(opt.id) === String(item.studentId)) ||
        opt.name === item.studentName
    );
    setSelectedStudentId(
      item.studentId !== null
        ? String(item.studentId)
        : matched
        ? String(matched.id)
        : ""
    );

    const existingSchedules = {};
    DAYS_OPTIONS.forEach((day) => {
      const slot = item.slots?.[day.key];
      if (slot?.startTime) existingSchedules[day.key] = slot.startTime;
    });
    setDaySchedules(existingSchedules);
    setIsAdding(true);
  };

  const handleStudentSelectChange = (e) => {
    const nextId = e.target.value;
    setSelectedStudentId(nextId);
    const found = studentOptions.find((opt) => String(opt.id) === nextId);
    setScheduleStudent(found ? found.name : "");
  };

  const handleRegister = async () => {
    const trimmedName = scheduleStudent.trim();
    const matchedByName = studentOptions.find(
      (opt) => opt.name === trimmedName
    );
    const resolvedStudentId = toNumericId(
      selectedStudentId || editingItem?.studentId || matchedByName?.id
    );

    if (resolvedStudentId === null) {
      alert("학생을 선택해주세요.");
      return;
    }

    const selectedDays = DAYS_OPTIONS.filter((day) =>
      Object.prototype.hasOwnProperty.call(daySchedules, day.key)
    );
    if (selectedDays.length === 0 || selectedDays.some((day) => !daySchedules[day.key])) {
      alert("요일을 선택하고 각 요일의 수업 시간을 입력해주세요.");
      return;
    }

    if (!resolvedClassId || submitting) return;

    const conflictingDays = selectedDays.filter((day) => {
      const existingRow = scheduleList.find(
        (item) => String(item.studentId) === String(resolvedStudentId)
      );
      return existingRow?.slots?.[day.key] && existingRow.id !== editingItem?.id;
    });
    if (conflictingDays.length > 0) {
      alert("해당 학생은 선택한 요일에 이미 수업이 등록되어 있습니다. 기존 시간표를 수정해주세요.");
      return;
    }

    const payloads = selectedDays.map((day) => ({
      dayKey: day.key,
      ruleId: editingItem?.slots?.[day.key]?.ruleId,
      data: {
        student_id: resolvedStudentId,
        day_of_week: day.fullApiDay,
        start_time: daySchedules[day.key],
        end_time: addOneHour(daySchedules[day.key]),
      },
    }));
    const removedSlots = editingItem
      ? DAYS_OPTIONS.filter(
          (day) => editingItem.slots?.[day.key] && !daySchedules[day.key]
        ).map((day) => editingItem.slots[day.key].ruleId)
      : [];

    setSubmitting(true);
    try {
      const writeResults = await Promise.all(
        payloads.map(async ({ dayKey, ruleId, data }) => {
          try {
            if (editingItem && ruleId !== undefined && ruleId !== null) {
              await updateClassScheduleRule(resolvedClassId, ruleId, {
                student_id: data.student_id,
                day_of_week: data.day_of_week,
                start_time: data.start_time,
                end_time: data.end_time,
              });
            } else {
              await createClassScheduleRule(resolvedClassId, data);
            }
            return null;
          } catch (err) {
            const day = DAYS_OPTIONS.find((option) => option.key === dayKey);
            const status = err.status ? ` (HTTP ${err.status})` : "";
            return `${day.fullLabel} ${daySchedules[dayKey]} 등록 실패: ${err.message || "요청에 실패했습니다."}${status}`;
          }
        })
      );
      const writeErrors = writeResults.filter(Boolean);
      if (writeErrors.length > 0) {
        await fetchSchedules();
        throw new Error(writeErrors.join("\n"));
      }

      if (editingItem) {
        await Promise.all(
          removedSlots.map((ruleId) =>
            deleteClassScheduleRule(resolvedClassId, ruleId)
          )
        );
      }

      await fetchSchedules();
      setEditingItem(null);
      setIsAdding(false);
    } catch (err) {
      const message = err.message || "시간표 등록에 실패했습니다.";
      alert(err.status ? `${message} (HTTP ${err.status})` : message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!resolvedClassId) return;
    try {
      const targetIds =
        Array.isArray(item.ruleIds) && item.ruleIds.length > 0
          ? item.ruleIds
          : [item.id];

      await Promise.all(
        targetIds.map((ruleId) =>
          deleteClassScheduleRule(resolvedClassId, ruleId)
        )
      );

      setScheduleList((prev) => prev.filter((row) => row.id !== item.id));
    } catch (err) {
      alert(err.message || "시간표 삭제에 실패했습니다.");
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
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="bottom-action-bar">
            <Button text="+ 학생 시간표 등록" color="blue" width={140} onClick={handleOpenForm} />
          </div>
        </section>
      ) : (
        <>
          <section className="form-section">
            <h2 className="form-title">{editingItem ? "학생 시간표 수정" : "학생 시간표 등록"}</h2>
            <div className="schedule-top-row">
              {studentOptions.length > 0 ? (
                <select
                  aria-label="학생 선택"
                  value={selectedStudentId}
                  onChange={handleStudentSelectChange}
                  className="form-control"
                >
                  <option value="">학생 선택</option>
                  {studentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="학생 이름 입력"
                  value={scheduleStudent}
                  onChange={(e) => setScheduleStudent(e.target.value)}
                  className="form-control"
                />
              )}
              <Button
                text={editingItem ? "수정" : "등록"}
                color="blue"
                width={100}
                onClick={handleRegister}
              />
              <Button
                text="취소"
                color="lightGray"
                width={80}
                onClick={handleCancelForm}
              />
            </div>
            <div className="day-select-group" role="group" aria-label="수업 요일 선택">
              {DAYS_OPTIONS.map((day) => {
                const isSelected = Object.prototype.hasOwnProperty.call(daySchedules, day.key);
                const classTime = daySchedules[day.key] || "";
                return (
                  <div key={day.key} className="day-time-item">
                    <button
                      type="button"
                      className={`day-chip ${isSelected ? "is-selected" : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => toggleDaySelection(day.key)}
                    >
                      {day.label}
                    </button>
                    {isSelected && (
                      <div className={`time-input-box ${!classTime ? "is-empty" : ""}`}>
                        {!classTime && <span className="time-placeholder">수업 시간</span>}
                        <input
                          type="time"
                          aria-label={`${day.fullLabel} 수업 시간`}
                          value={classTime}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          onChange={(e) =>
                            setDaySchedules((current) => ({
                              ...current,
                              [day.key]: e.target.value,
                            }))
                          }
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
            <ScheduleTable
              scheduleList={scheduleList}
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
