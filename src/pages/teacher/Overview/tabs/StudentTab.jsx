import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import { getClassStudents } from "../../../../api/overviewApi.js";

function formatAbsenceDate(dateString) {
  if (!dateString) return "—";
  const parts = dateString.split("-");
  if (parts.length < 3) return dateString;
  return `${Number(parts[1])}월 ${Number(parts[2])}일`;
}

export default function StudentTab({ classId, classroomId }) {
  const params = useParams();
  const activeClassId =
    classId ?? classroomId ?? params.classroomId ?? params.classId ?? params.id;

  const [searchKeyword, setSearchKeyword] = useState("");
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    if (!activeClassId) return;

    async function fetchStudents() {
      try {
        const data = await getClassStudents(activeClassId);
        const list = Array.isArray(data) ? data : [];
        setStudentList(
          list.map((item) => {
            const makeup = item.makeupCount ?? 0;
            const absence = item.absenceCount ?? 0;
            const needed = Math.max(0, absence - makeup);

            return {
              id: item.studentId,
              studentName: item.name,
              makeupCount: `${makeup} / ${absence}`,
              recentAbsence: formatAbsenceDate(item.lastAbsenceDate),
              makeupStatus: needed > 0 ? "필요" : "불필요",
              makeupDaysNeeded: `${needed}일`,
            };
          })
        );
      } catch (error) {
        console.error("학생 목록 조회 실패:", error);
      }
    }

    fetchStudents();
  }, [activeClassId]);

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