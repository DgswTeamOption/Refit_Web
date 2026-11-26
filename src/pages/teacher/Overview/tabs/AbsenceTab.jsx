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

function formatAbsenceDate(rawDate) {
  if (!rawDate) return "-";
  const str = String(rawDate).trim();
  const match = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) {
    return `${Number(match[2])}월 ${Number(match[3])}일`;
  }
  return str;
}

function normalizeAbsenceStatus(rawStatus) {
  if (rawStatus === 1 || rawStatus === "1" || rawStatus === true) return "수락됨";
  if (rawStatus === 2 || rawStatus === "2" || rawStatus === false) return "거절됨";
  if (rawStatus === 3 || rawStatus === "3") return "취소됨";
  const str = String(rawStatus ?? "").trim().toUpperCase();
  if (["APPROVED", "수락", "수락됨", "승인", "승인됨"].includes(str)) return "수락됨";
  if (["REJECTED", "거절", "거절됨", "반려", "반려됨"].includes(str)) return "거절됨";
  if (["CANCELED", "CANCELLED", "취소됨"].includes(str)) return "취소됨";
  return "대기중";
}

function mapAbsenceItem(item) {
  const id = item?.id ?? item?.absenceId ?? item?.absence_id ?? null;

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
    status: normalizeAbsenceStatus(
      item?.approval_status ?? item?.approvalStatus ?? item?.status
    ),
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
      setAbsenceList(list.map(mapAbsenceItem));
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
    setAbsenceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleApprove = async (id) => {
    if (id === undefined || id === null || id === "") return;
    if (processingId === id) return;
    const confirmed = window.confirm(
      "이 결석 신청을 승인할까요? 승인 후에는 결석 상태를 수정할 수 없습니다."
    );
    if (!confirmed) return;

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
      setActionMessages((prev) => ({ ...prev, [id]: message }));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (id === undefined || id === null || id === "") return;
    if (processingId === id) return;
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
            absenceList.map((item, index) => (
              <tr key={item.id ?? `absence-${index}`}>
                <td>{item.studentName}</td>
                <td>{item.date}</td>
                <td>{item.reason}</td>
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
