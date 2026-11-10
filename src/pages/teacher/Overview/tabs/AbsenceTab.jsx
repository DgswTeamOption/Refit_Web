import React, { useState } from "react";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";

export default function AbsenceTab() {
  const [absenceList, setAbsenceList] = useState([
    { id: 1, studentName: "김민지", date: "8월 27일", reason: "병원 방문", status: "대기중" },
    { id: 2, studentName: "박서준", date: "8월 25일", reason: "가족 일정", status: "수락됨" },
    { id: 3, studentName: "이서연", date: "8월 20일", reason: "개인 일정", status: "거절됨" },
  ]);

  const updateAbsenceStatus = (id, newStatus) => {
    setAbsenceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
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
                      <Button text="수락" color="blue" width={60} onClick={() => updateAbsenceStatus(item.id, "수락됨")} />
                      <Button text="거절" color="red" width={60} onClick={() => updateAbsenceStatus(item.id, "거절됨")} />
                    </>
                  ) : (
                    <Button text="수정" color="lightGray" width={60} onClick={() => updateAbsenceStatus(item.id, "대기중")} />
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