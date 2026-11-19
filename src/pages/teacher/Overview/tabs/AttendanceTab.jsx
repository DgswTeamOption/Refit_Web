import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";
import {
  getClassAttendance,
  updateClassAttendance,
} from "../../../../api/overviewApi.js";

const ATTENDANCE_STATUS_MAP = {
  PRESENT: "출석",
  ABSENT: "결석",
  LATE: "지각",
};

const SERVER_STATUS_MAP = {
  출석: "PRESENT",
  결석: "ABSENT",
};

function getTodayStrings() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return {
    queryDate: `${year}-${month}-${day}`,
    displayDate: `${year}년 ${Number(month)}월 ${Number(day)}일`,
  };
}

export default function AttendanceTab({ classId, classroomId }) {
  const params = useParams();
  const activeClassId =
    classId ?? classroomId ?? params.classroomId ?? params.classId ?? params.id;

  const { queryDate, displayDate } = getTodayStrings();
  const [attendanceList, setAttendanceList] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    if (!activeClassId) return;

    async function fetchAttendance() {
      try {
        const data = await getClassAttendance(activeClassId, queryDate);
        const list = Array.isArray(data) ? data : [];
        setAttendanceList(
          list.map((item, index) => ({
            id: item.schedule_id ?? item.student_id ?? index,
            scheduleId: item.schedule_id,
            studentName: item.student_name,
            status: ATTENDANCE_STATUS_MAP[item.status] || "대기중",
          }))
        );
      } catch (error) {
        console.error("출석 목록 조회 실패:", error);
      }
    }

    fetchAttendance();
  }, [activeClassId, queryDate]);

  const handleStartEditAttendance = (id) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "대기중" } : item))
    );
  };

  const handleSelectAttendance = async (item, newStatus) => {
    if (submittingId === item.id) return;
    const serverStatus = SERVER_STATUS_MAP[newStatus];
    if (!serverStatus || !item.scheduleId) return;

    try {
      setSubmittingId(item.id);
      await updateClassAttendance(activeClassId, item.scheduleId, serverStatus);
      setAttendanceList((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, status: newStatus } : row
        )
      );
    } catch (error) {
      alert(error.message || "출석 상태 변경에 실패했습니다.");
    } finally {
      setSubmittingId(null);
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
            {attendanceList.map((item) => (
              <tr key={item.id}>
                <td>{item.studentName}</td>
                <td>
                  <Condition status={item.status} />
                </td>
                <td>
                  <div className="action-buttons">
                    {item.status === "대기중" ? (
                      <>
                        <Button
                          text="출석"
                          color="blue"
                          width={60}
                          onClick={() => handleSelectAttendance(item, "출석")}
                        />
                        <Button
                          text="결석"
                          color="red"
                          width={60}
                          onClick={() => handleSelectAttendance(item, "결석")}
                        />
                      </>
                    ) : (
                      <Button
                        text="수정"
                        color="lightGray"
                        width={60}
                        onClick={() => handleStartEditAttendance(item.id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}