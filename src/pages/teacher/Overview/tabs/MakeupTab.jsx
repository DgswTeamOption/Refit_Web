import React, { useState } from "react";
import Condition from "../../../../components/Condition/Condition";
import Button from "../../../../components/Button/Button";

export default function MakeupTab() {
  const [makeupList, setMakeupList] = useState([
    { id: 1, studentName: "김민지", date: "8월 29일", time: "16:00", status: "대기중" },
    { id: 2, studentName: "이서연", date: "8월 30일", time: "17:00", status: "수락됨" },
    { id: 3, studentName: "박서준", date: "8월 31일", time: "15:00", status: "거절됨" },
  ]);

  const updateMakeupStatus = (id, newStatus) => {
    setMakeupList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
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
                      <Button text="수락" color="blue" width={60} onClick={() => updateMakeupStatus(item.id, "수락됨")} />
                      <Button text="거절" color="red" width={60} onClick={() => updateMakeupStatus(item.id, "거절됨")} />
                    </>
                  ) : (
                    <Button text="수정" color="lightGray" width={60} onClick={() => updateMakeupStatus(item.id, "대기중")} />
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