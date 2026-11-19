import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";
import {
  getClassMakeups,
  getClassStudents,
  approveMakeup,
  cancelMakeup,
} from "../../../../api/overviewApi.js";

const MAKEUP_STATUS_MAP = {
  0: "대기중",
  1: "수락됨",
  2: "거절됨",
  [-1]: "거절됨",
};

function formatMakeupDateTime(isoString) {
  if (!isoString) return { date: "", time: "" };
  const dateObj = new Date(isoString);
  if (Number.isNaN(dateObj.getTime())) return { date: isoString, time: "" };

  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return {
    date: `${month}월 ${day}일`,
    time: `${hours}:${minutes}`,
  };
}

export default function MakeupTab({ classId, classroomId }) {
  const params = useParams();
  const activeClassId =
    classId ?? classroomId ?? params.classroomId ?? params.classId ?? params.id;

  const [makeupList, setMakeupList] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    if (!activeClassId) return;

    async function fetchMakeups() {
      try {
        const [makeupsData, studentsData] = await Promise.all([
          getClassMakeups(activeClassId),
          getClassStudents(activeClassId).catch(() => []),
        ]);

        const studentNameMap = new Map();
        (Array.isArray(studentsData) ? studentsData : []).forEach((student) => {
          studentNameMap.set(student.studentId, student.name);
        });

        const list = Array.isArray(makeupsData) ? makeupsData : [];
        setMakeupList(
          list.map((item) => {
            const { date, time } = formatMakeupDateTime(item.makeup_time);
            return {
              id: item.id,
              studentName:
                item.student_name ||
                studentNameMap.get(item.student_id) ||
                `학생 ${item.student_id}`,
              date,
              time,
              status: MAKEUP_STATUS_MAP[item.approval_status] || "대기중",
            };
          })
        );
      } catch (error) {
        console.error("보강 신청 목록 조회 실패:", error);
      }
    }

    fetchMakeups();
  }, [activeClassId]);

  const handleApprove = async (id) => {
    if (submittingId === id) return;
    try {
      setSubmittingId(id);
      await approveMakeup(id, 1);
      setMakeupList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "수락됨" } : item))
      );
    } catch (error) {
      alert(error.message || "보강 신청 수락에 실패했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id) => {
    if (submittingId === id) return;
    try {
      setSubmittingId(id);
      await cancelMakeup(id);
      setMakeupList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "거절됨" } : item))
      );
    } catch (error) {
      alert(error.message || "보강 신청 거절에 실패했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleStartEdit = (id) => {
    setMakeupList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "대기중" } : item))
    );
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
          {makeupList.map((item) => (
            <tr key={item.id}>
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
                    <Button
                      text="수정"
                      color="lightGray"
                      width={60}
                      onClick={() => handleStartEdit(item.id)}
                    />
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