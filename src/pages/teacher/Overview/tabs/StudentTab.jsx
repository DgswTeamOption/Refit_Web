import React, { useState, useMemo } from "react";
import Condition from "../../../../components/Condition/Condition";

export default function StudentTab() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [studentList] = useState([
    { id: 1, studentName: "김민지", makeupCount: "1 / 2", recentAbsence: "8월 27일", makeupStatus: "필요", makeupDaysNeeded: "1일" },
    { id: 2, studentName: "박서준", makeupCount: "0 / 1", recentAbsence: "8월 25일", makeupStatus: "불필요", makeupDaysNeeded: "0일" },
    { id: 3, studentName: "이서연", makeupCount: "2 / 3", recentAbsence: "8월 20일", makeupStatus: "필요", makeupDaysNeeded: "1일" },
  ]);

  const filteredStudentList = useMemo(() => {
    if (!searchKeyword.trim()) return studentList;
    return studentList.filter((item) =>
      item.studentName.includes(searchKeyword.trim())
    );
  }, [searchKeyword, studentList]);

  return (
    <>
      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder="학생 이름 검색"
          className="student-search-input"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>
      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>학생</th>
              <th>보강 / 총 결석</th>
              <th>최근 결석</th>
              <th>보강 여부</th>
              <th>보강 필요 일수</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudentList.map((item) => (
              <tr key={item.id}>
                <td>{item.studentName}</td>
                <td>{item.makeupCount}</td>
                <td>{item.recentAbsence}</td>
                <td>
                  <Condition status={item.makeupStatus} />
                </td>
                <td>{item.makeupDaysNeeded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}