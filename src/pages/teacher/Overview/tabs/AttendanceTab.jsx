import React, { useState } from "react";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";

export default function AttendanceTab() {
  const [attendanceList, setAttendanceList] = useState([
    { id: 1, studentName: "김민지", status: "출석" },
    { id: 2, studentName: "박서준", status: "출석" },
    { id: 3, studentName: "이서연", status: "결석" },
  ]);

  const handleStartEditAttendance = (id) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "대기중" } : item))
    );
  };

  const handleSelectAttendance = (id, newStatus) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <>
      <div className="section-date-title">2026년 8월 27일</div>
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
                        <Button text="출석" color="blue" width={60} onClick={() => handleSelectAttendance(item.id, "출석")} />
                        <Button text="결석" color="red" width={60} onClick={() => handleSelectAttendance(item.id, "결석")} />
                      </>
                    ) : (
                      <Button text="수정" color="lightGray" width={60} onClick={() => handleStartEditAttendance(item.id)} />
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