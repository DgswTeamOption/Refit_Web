import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";
import {
  getClassAbsences,
  approveAbsence,
  rejectAbsence,
} from "../../../../api/overviewApi.js";

const STATUS_MAP = {
  PENDING: "대기중",
  APPROVED: "수락됨",
  REJECTED: "거절됨",
  CANCELED: "취소됨",
};

function formatAbsenceDate(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length < 3) return dateString;
  return `${Number(parts[1])}월 ${Number(parts[2])}일`;
}

export default function AbsenceTab({ classId, classroomId }) {
  const params = useParams();
  const activeClassId =
    classId ?? classroomId ?? params.classroomId ?? params.classId ?? params.id;

  const [absenceList, setAbsenceList] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    if (!activeClassId) return;

    async function fetchAbsences() {
      try {
        const data = await getClassAbsences(activeClassId);
        const list = Array.isArray(data) ? data : [];
        setAbsenceList(
          list.map((item) => ({
            id: item.id,
            studentName: item.student_name,
            date: formatAbsenceDate(item.absence_date),
            reason: item.reason,
            status: STATUS_MAP[item.status] ?? "대기중",
          }))
        );
      } catch (error) {
        console.error("결석 목록 조회 실패:", error);
      }
    }

    fetchAbsences();
  }, [activeClassId]);

  const handleApprove = async (id) => {
    if (submittingId === id) return;
    try {
      setSubmittingId(id);
      await approveAbsence(id);
      setAbsenceList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "수락됨" } : item))
      );
    } catch (error) {
      alert(error.message || "결석 수락에 실패했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id) => {
    if (submittingId === id) return;
    try {
      setSubmittingId(id);
      await rejectAbsence(id);
      setAbsenceList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "거절됨" } : item))
      );
    } catch (error) {
      alert(error.message || "결석 거절에 실패했습니다.");
    } finally {
      setSubmittingId(null);
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
          {absenceList.map((item) => (
            <tr key={item.id}>
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
                        onClick={() => handleApprove(item.id)}
                      />
                      <Button
                        text="거절"
                        color="red"
                        width={60}
                        onClick={() => handleReject(item.id)}
                      />
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}