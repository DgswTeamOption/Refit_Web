import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";
import {
  getClassAbsences,
  approveAbsence,
  rejectAbsence,
} from "../../../../api/overviewApi";

function normalizeValidId(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return "";
  return str;
}

function getCachedStatuses(classId) {
  try {
    const raw = sessionStorage.getItem(`absence_status_cache_${classId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCachedStatus(classId, absenceId, status) {
  try {
    const prev = getCachedStatuses(classId);
    prev[String(absenceId)] = status;
    sessionStorage.setItem(
      `absence_status_cache_${classId}`,
      JSON.stringify(prev)
    );
  } catch {
  }
}

function formatAbsenceDate(rawDate) {
  if (!rawDate) return "-";
  const str = String(rawDate).trim();
  const match = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) {
    return `${Number(match[2])}월 ${Number(match[3])}일`;
  }
  return str;
}

function extractRawAbsenceStatus(item) {
  if (!item || typeof item !== "object") return undefined;

  const directKeys = [
    "status",
    "approvalStatus",
    "approval_status",
    "absenceStatus",
    "absence_status",
    "requestStatus",
    "request_status",
    "state",
    "result",
    "decision",
    "permitStatus",
    "permit_status",
    "confirmStatus",
    "confirm_status",
  ];
  for (const key of directKeys) {
    if (item[key] !== undefined && item[key] !== null) return item[key];
  }

  if (typeof item.approved === "boolean") return item.approved ? "APPROVED" : "REJECTED";
  if (typeof item.isApproved === "boolean") return item.isApproved ? "APPROVED" : "REJECTED";
  if (typeof item.is_approved === "boolean") return item.is_approved ? "APPROVED" : "REJECTED";
  if (typeof item.accepted === "boolean") return item.accepted ? "APPROVED" : "REJECTED";
  if (typeof item.isAccepted === "boolean") return item.isAccepted ? "APPROVED" : "REJECTED";
  if (typeof item.is_accepted === "boolean") return item.is_accepted ? "APPROVED" : "REJECTED";
  if (typeof item.rejected === "boolean" && item.rejected) return "REJECTED";
  if (typeof item.isRejected === "boolean" && item.isRejected) return "REJECTED";
  if (typeof item.is_rejected === "boolean" && item.is_rejected) return "REJECTED";

  for (const [key, val] of Object.entries(item)) {
    if (val === undefined || val === null || typeof val === "object") continue;
    const lower = key.toLowerCase();
    if (
      (lower.includes("status") ||
        lower.includes("approve") ||
        lower.includes("accept") ||
        lower.includes("reject") ||
        lower.includes("state")) &&
      !lower.includes("student") &&
      !lower.includes("class")
    ) {
      return val;
    }
  }

  return undefined;
}

function normalizeAbsenceStatus(rawStatus) {
  if (rawStatus === 1 || rawStatus === "1" || rawStatus === true) return "수락됨";
  if (rawStatus === 2 || rawStatus === "2" || rawStatus === false) return "거절됨";
  const str = String(rawStatus ?? "").trim().toUpperCase();
  if (
    [
      "APPROVED",
      "APPROVE",
      "APPROVAL",
      "ACCEPTED",
      "ACCEPT",
      "ACCEPTANCE",
      "CONFIRMED",
      "CONFIRM",
      "PERMITTED",
      "PERMIT",
      "COMPLETED",
      "DONE",
      "Y",
      "YES",
      "PASS",
      "수락",
      "수락됨",
      "승인",
      "승인됨",
    ].includes(str)
  ) {
    return "수락됨";
  }
  if (
    [
      "REJECTED",
      "REJECT",
      "REJECTION",
      "DECLINED",
      "DECLINE",
      "REFUSED",
      "REFUSAL",
      "DENIED",
      "DENY",
      "CANCELED",
      "CANCELLED",
      "N",
      "NO",
      "FAIL",
      "거절",
      "거절됨",
      "반려",
      "반려됨",
    ].includes(str)
  ) {
    return "거절됨";
  }
  return "대기중";
}

function mapAbsenceItem(item, index, cachedStatuses) {
  const id = item?.id ?? item?.absenceId ?? item?.absence_id ?? index;
  const rawStatus = extractRawAbsenceStatus(item);
  const finalStatus =
    rawStatus === undefined
      ? cachedStatuses[String(id)] || "대기중"
      : normalizeAbsenceStatus(rawStatus);

  return {
    id,
    studentName:
      item?.studentName ??
      item?.student_name ??
      item?.name ??
      item?.student?.name ??
      "-",
    date: formatAbsenceDate(
      item?.date ??
        item?.absenceDate ??
        item?.absence_date ??
        item?.scheduleDate ??
        item?.schedule_date ??
        item?.startTime
    ),
    reason:
      item?.reason ??
      item?.absenceReason ??
      item?.absence_reason ??
      item?.content ??
      "-",
    status: finalStatus,
  };
}

export default function AbsenceTab({ classId, classroomId }) {
  const params = useParams();
  const resolvedClassId =
    normalizeValidId(classId) ||
    normalizeValidId(classroomId) ||
    normalizeValidId(params.classId ?? params.classroomId ?? params.id);

  const [absenceList, setAbsenceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [actionMessages, setActionMessages] = useState({});

  const fetchAbsences = useCallback(async () => {
    if (!resolvedClassId) {
      setAbsenceList([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await getClassAbsences(resolvedClassId);
      const list = Array.isArray(res)
        ? res
        : res?.absences || res?.content || res?.items || res?.list || [];
      const cached = getCachedStatuses(resolvedClassId);
      setAbsenceList(list.map((item, idx) => mapAbsenceItem(item, idx, cached)));
    } catch (err) {
      setError(err.message || "결석 정보를 불러오지 못했습니다.");
      setAbsenceList([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedClassId]);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  const updateLocalStatus = (id, newStatus) => {
    if (resolvedClassId) {
      setCachedStatus(resolvedClassId, id, newStatus);
    }
    setAbsenceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleApprove = async (id) => {
    if (processingId === id) return;
    const currentItem = absenceList.find((item) => item.id === id);
    if (currentItem && currentItem.status !== "대기중") {
      setEditingId(null);
      setActionMessages((prev) => ({
        ...prev,
        [id]: "이미 처리된 결석 신청입니다. 서버에서 상태 변경을 허용하지 않습니다.",
      }));
      return;
    }
    setProcessingId(id);
    try {
      await approveAbsence(id);
      setActionMessages((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      updateLocalStatus(id, "수락됨");
      await fetchAbsences();
    } catch (err) {
      const message = err.message || "결석 수락 처리에 실패했습니다.";
      if (message.includes("이미 처리된")) {
        await fetchAbsences();
      }
      setActionMessages((prev) => ({ ...prev, [id]: message }));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (processingId === id) return;
    const currentItem = absenceList.find((item) => item.id === id);
    if (currentItem && currentItem.status !== "대기중") {
      setEditingId(null);
      setActionMessages((prev) => ({
        ...prev,
        [id]: "이미 처리된 결석 신청입니다. 서버에서 상태 변경을 허용하지 않습니다.",
      }));
      return;
    }
    setProcessingId(id);
    try {
      await rejectAbsence(id);
      setActionMessages((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      updateLocalStatus(id, "거절됨");
      await fetchAbsences();
    } catch (err) {
      const message = err.message || "결석 거절 처리에 실패했습니다.";
      if (message.includes("이미 처리된")) {
        await fetchAbsences();
      }
      setActionMessages((prev) => ({ ...prev, [id]: message }));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="table-wrapper">
      <table className="absence-table">
        <thead>
          <tr>
            <th>학생</th>
            <th>결석 날짜</th>
            <th>사유</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5}>결석 정보를 불러오는 중입니다.</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5}>{error}</td>
            </tr>
          ) : absenceList.length === 0 ? (
            <tr>
              <td colSpan={5}>등록된 결석 정보가 없습니다.</td>
            </tr>
          ) : (
            absenceList.map((item) => (
              <tr key={item.id}>
                <td>{item.studentName}</td>
                <td>{item.date}</td>
                <td>{item.reason}</td>
                <td>
                  <Condition status={item.status} />
                </td>
                <td>
                  <div className="action-buttons">
                    {item.status === "대기중" || editingId === item.id ? (
                      <>
                        <Button
                          text="수락"
                          color="blue"
                          width={60}
                          disabled={processingId === item.id}
                          onClick={() => handleApprove(item.id)}
                        />
                        <Button
                          text="거절"
                          color="red"
                          width={60}
                          disabled={processingId === item.id}
                          onClick={() => handleReject(item.id)}
                        />
                      </>
                    ) : (
                      <Button
                        text="수정"
                        color="lightGray"
                        width={60}
                        onClick={() => {
                          setActionMessages((prev) => {
                            const next = { ...prev };
                            delete next[item.id];
                            return next;
                          });
                          setEditingId(item.id);
                        }}
                      />
                    )}
                  </div>
                  {actionMessages[item.id] && (
                    <p className="absence-action-message" role="alert">
                      {actionMessages[item.id]}
                    </p>
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
