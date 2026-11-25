import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";
import {
  getClassStudents,
  getClassMakeups,
  approveMakeup,
  rejectMakeup,
} from "../../../../api/overviewApi";

function normalizeValidId(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return "";
  return str;
}

function formatMakeupDate(rawDate) {
  if (!rawDate) return "-";
  const str = String(rawDate).trim();
  const match = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) {
    return `${Number(match[2])}월 ${Number(match[3])}일`;
  }
  return str;
}

function formatMakeupTime(rawTime) {
  if (!rawTime) return "-";
  const str = String(rawTime).trim();
  const match = str.match(/(\d{1,2}:\d{2})/);
  if (match) {
    const [hour, minute] = match[1].split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  }
  return str;
}

function extractList(response, keys) {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
}

function normalizeMakeupStatus(rawStatus) {
  if (rawStatus === 0 || rawStatus === "0") return "대기중";
  if (rawStatus === 1 || rawStatus === "1") return "수락됨";
  if (rawStatus === 2 || rawStatus === "2") return "거절됨";
  if (rawStatus === 3 || rawStatus === "3") return "취소됨";
  const str = String(rawStatus ?? "").trim().toUpperCase();
  if (["APPROVED", "ACCEPTED", "수락", "수락됨", "승인", "승인됨"].includes(str)) {
    return "수락됨";
  }
  if (["REJECTED", "DECLINED", "거절", "거절됨"].includes(str)) {
    return "거절됨";
  }
  if (["CANCELED", "CANCELLED", "취소", "취소됨"].includes(str)) {
    return "취소됨";
  }
  return "대기중";
}

function mapMakeupItem(item, studentNamesById) {
  const rawDate =
    item?.date ??
    item?.makeupDate ??
    item?.makeup_date ??
    item?.scheduleDate ??
    item?.schedule_date ??
    item?.makeup_time ??
    item?.makeupTime ??
    item?.startTime;
  const rawTime =
    item?.time ??
    item?.makeupTime ??
    item?.makeup_time ??
    item?.startTime ??
    item?.start_time;

  const studentId = normalizeValidId(
    item?.student_id ?? item?.studentId ?? item?.student?.id
  );
  const studentName =
    item?.studentName ??
    item?.student_name ??
    item?.name ??
    item?.student?.name ??
    studentNamesById.get(studentId) ??
    (studentId ? `학생 ${studentId}` : "-");

  return {
    id: item?.id ?? item?.makeupId ?? item?.makeup_id ?? null,
    studentName,
    date: formatMakeupDate(rawDate),
    time: formatMakeupTime(rawTime),
    status: normalizeMakeupStatus(
      item?.approval_status ?? item?.approvalStatus ?? item?.status
    ),
  };
}

export default function MakeupTab({ classId, classroomId }) {
  const params = useParams();
  const resolvedClassId =
    normalizeValidId(classId) ||
    normalizeValidId(classroomId) ||
    normalizeValidId(params.classId ?? params.classroomId ?? params.id);

  const [makeupList, setMakeupList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!resolvedClassId) {
      setMakeupList([]);
      setLoading(false);
      setError("");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    Promise.allSettled([
      getClassMakeups(resolvedClassId),
      getClassStudents(resolvedClassId),
    ])
      .then(([makeupResult, studentsResult]) => {
        if (!isMounted) return;
        if (makeupResult.status === "rejected") {
          setError(
            makeupResult.reason?.message || "보강 신청 목록을 불러오지 못했습니다."
          );
          setMakeupList([]);
          return;
        }

        const students =
          studentsResult.status === "fulfilled"
            ? extractList(studentsResult.value, ["students", "content", "items", "list"])
            : [];
        const studentNamesById = new Map(
          students
            .map((student) => {
              const id = normalizeValidId(
                student?.student_id ?? student?.studentId ?? student?.id
              );
              const name =
                student?.name ?? student?.studentName ?? student?.student_name;
              return id && name ? [id, name] : null;
            })
            .filter(Boolean)
        );
        const makeups = extractList(makeupResult.value, [
          "makeups",
          "content",
          "items",
          "list",
        ]);
        setMakeupList(makeups.map((item) => mapMakeupItem(item, studentNamesById)));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedClassId]);

  const updateLocalStatus = (id, newStatus) => {
    setMakeupList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleApprove = async (id) => {
    if (id === undefined || id === null || id === "") return;
    if (processingId === id) return;
    setProcessingId(id);
    try {
      await approveMakeup(id);
      updateLocalStatus(id, "수락됨");
    } catch (err) {
      alert(err.message || "보강 수락 처리에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (id === undefined || id === null || id === "") return;
    if (processingId === id) return;
    setProcessingId(id);
    try {
      await rejectMakeup(id);
      updateLocalStatus(id, "거절됨");
    } catch (err) {
      alert(err.message || "보강 거절 처리에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="table-wrapper">
      <table className="makeup-table">
        <thead>
          <tr>
            <th>학생</th>
            <th>보강 날짜</th>
            <th>시간</th>
            <th>승인 상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5}>보강 정보를 불러오는 중입니다.</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5}>{error}</td>
            </tr>
          ) : makeupList.length === 0 ? (
            <tr>
              <td colSpan={5}>등록된 보강 정보가 없습니다.</td>
            </tr>
          ) : (
            makeupList.map((item, index) => (
              <tr key={item.id ?? `makeup-${index}`}>
                <td>{item.studentName}</td>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td>
                  <Condition status={item.status} />
                </td>
                <td>
                  <div className="action-buttons">
                    {item.status === "대기중" ? (
                      <>
                        <Button
                          text="수락"
                          color="blue"
                          width={60}
                          disabled={item.id === null || processingId === item.id}
                          onClick={() => handleApprove(item.id)}
                        />
                        <Button
                          text="거절"
                          color="red"
                          width={60}
                          disabled={item.id === null || processingId === item.id}
                          onClick={() => handleReject(item.id)}
                        />
                      </>
                    ) : (
                      <span>-</span>
                    )}
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
