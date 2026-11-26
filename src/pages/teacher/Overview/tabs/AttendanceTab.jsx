import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";
import {
  getClassAttendance,
  updateClassAttendance,
} from "../../../../api/overviewApi";

function normalizeValidId(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return "";
  return str;
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatKoreanDate(rawDate) {
  if (!rawDate) return "";
  const str = String(rawDate).trim();
  const match = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) {
    return `${Number(match[1])}년 ${Number(match[2])}월 ${Number(match[3])}일`;
  }
  return str;
}

function normalizeAttendanceStatus(rawStatus) {
  if (rawStatus === 1 || rawStatus === "1") return "출석";
  if (rawStatus === 2 || rawStatus === "2") return "결석";
  const str = String(rawStatus ?? "").trim().toUpperCase();
  if (["PRESENT", "ATTENDED", "출석"].includes(str)) return "출석";
  if (["ABSENT", "결석"].includes(str)) return "결석";
  if (["LATE", "지각"].includes(str)) return "지각";
  if (["MAKEUP", "보강"].includes(str)) return "보강";
  return "대기중";
}

function toApiAttendanceStatus(uiStatus) {
  if (uiStatus === "출석") return "PRESENT";
  if (uiStatus === "결석") return "ABSENT";
  if (uiStatus === "지각") return "LATE";
  return "UNCHECKED";
}

function mapAttendanceItem(item, index) {
  const scheduleId =
    item?.scheduleId ??
    item?.schedule_id ??
    item?.schedule?.id ??
    item?.schedule?.scheduleId ??
    item?.id ??
    null;
  const rowId =
    item?.attendanceId ?? item?.attendance_id ?? scheduleId ?? `attendance-${index}`;

  return {
    id: rowId,
    scheduleId,
    studentName:
      item?.studentName ??
      item?.student_name ??
      item?.name ??
      item?.student?.name ??
      "-",
    status: normalizeAttendanceStatus(
      item?.status ?? item?.attendanceStatus ?? item?.attendance_status
    ),
  };
}

export default function AttendanceTab({ classId, classroomId, date }) {
  const params = useParams();
  const resolvedClassId =
    normalizeValidId(classId) ||
    normalizeValidId(classroomId) ||
    normalizeValidId(params.classId ?? params.classroomId ?? params.id);

  const targetDate = date || getTodayDateKey();
  const [displayDate, setDisplayDate] = useState(() =>
    formatKoreanDate(targetDate)
  );
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [editingSelection, setEditingSelection] = useState(null);
  const editScope = `${resolvedClassId}:${targetDate}`;
  const editingId = editingSelection?.scope === editScope ? editingSelection.id : null;

  useEffect(() => {
    setDisplayDate(formatKoreanDate(targetDate));

    if (!resolvedClassId) {
      setAttendanceList([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    getClassAttendance(resolvedClassId, targetDate)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res)
          ? res
          : res?.attendances ||
            res?.attendance ||
            res?.students ||
            res?.content ||
            res?.items ||
            res?.list ||
            [];

        const serverDate =
          res?.date ??
          list[0]?.date ??
          list[0]?.scheduleDate ??
          list[0]?.schedule_date ??
          list[0]?.startTime;
        if (serverDate) {
          setDisplayDate(formatKoreanDate(serverDate));
        }

        setAttendanceList(list.map(mapAttendanceItem));
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = err.message || "출석 정보를 불러오지 못했습니다.";
        setError(err.status ? `${message} (HTTP ${err.status})` : message);
        setAttendanceList([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedClassId, targetDate]);

  const handleStartEditAttendance = (id) => {
    setEditingSelection({ scope: editScope, id });
  };

  const handleSelectAttendance = async (item, newStatus) => {
    if (!resolvedClassId || processingId === item.id) return;
    if (item.scheduleId === undefined || item.scheduleId === null || item.scheduleId === "") {
      alert("수업 일정 ID를 확인할 수 없어 출석 상태를 변경하지 못했습니다.");
      return;
    }
    setProcessingId(item.id);
    try {
      await updateClassAttendance(
        resolvedClassId,
        item.scheduleId,
        toApiAttendanceStatus(newStatus)
      );
      setAttendanceList((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, status: newStatus } : row
        )
      );
      setEditingSelection(null);
    } catch (err) {
      alert(err.message || "출석 상태 변경에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="section-date-title">{displayDate}</div>
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
            {loading ? (
              <tr>
                <td colSpan={3}>출석 정보를 불러오는 중입니다.</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3}>{error}</td>
              </tr>
            ) : attendanceList.length === 0 ? (
              <tr>
                <td colSpan={3}>등록된 출석 정보가 없습니다.</td>
              </tr>
            ) : (
              attendanceList.map((item) => (
                <tr key={item.id}>
                  <td>{item.studentName}</td>
                  <td>
                    <Condition status={item.status} />
                  </td>
                  <td>
                    <div className="action-buttons">
                      {item.status === "대기중" || editingId === item.id ? (
                        <>
                          <Button
                            text="출석"
                            color="blue"
                            width={60}
                            disabled={processingId === item.id}
                            onClick={() => handleSelectAttendance(item, "출석")}
                          />
                          <Button
                            text="결석"
                            color="red"
                            width={60}
                            disabled={processingId === item.id}
                            onClick={() => handleSelectAttendance(item, "결석")}
                          />
                        </>
                      ) : (
                        <Button
                          text="수정"
                          color="lightGray"
                          width={60}
                          disabled={processingId === item.id}
                          onClick={() => handleStartEditAttendance(item.id)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
