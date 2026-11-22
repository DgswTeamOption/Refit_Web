import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Condition from "../../../../components/Condition/Condition";
import { getClassStudents } from "../../../../api/overviewApi";

function normalizeValidId(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return "";
  return str;
}

function formatKoreanMonthDay(rawDate) {
  if (!rawDate) return "-";
  const str = String(rawDate).trim();
  const match = str.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (match) {
    return `${Number(match[2])}월 ${Number(match[3])}일`;
  }
  return str;
}

function mapStudentItem(item, index) {
  const studentId =
    item?.studentId ?? item?.student_id ?? item?.id ?? index;
  const studentName =
    item?.name ?? item?.studentName ?? item?.student_name ?? "-";

  const completedMakeup = Number(
    item?.makeupCount ?? item?.makeup_count ?? 0
  );
  const totalAbsence = Number(
    item?.absenceCount ?? item?.absence_count ?? 0
  );

  const neededDays = Math.max(0, totalAbsence - completedMakeup);

  return {
    id: studentId,
    studentName,
    makeupCount: `${completedMakeup} / ${totalAbsence}`,
    recentAbsence: formatKoreanMonthDay(
      item?.lastAbsenceDate ?? item?.last_absence_date
    ),
    makeupStatus: neededDays > 0 ? "필요" : "불필요",
    makeupDaysNeeded: `${neededDays}일`,
  };
}

export default function StudentTab({ classId, classroomId }) {
  const params = useParams();
  const resolvedClassId =
    normalizeValidId(classId) ||
    normalizeValidId(classroomId) ||
    normalizeValidId(params.classId ?? params.classroomId ?? params.id);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resolvedClassId) {
      setStudentList([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    getClassStudents(resolvedClassId)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res)
          ? res
          : res?.students || res?.content || res?.items || res?.list || [];
        setStudentList(list.map(mapStudentItem));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "학생 목록을 불러오지 못했습니다.");
        setStudentList([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedClassId]);

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
            {loading ? (
              <tr>
                <td colSpan={5}>학생 목록을 불러오는 중입니다.</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5}>{error}</td>
              </tr>
            ) : filteredStudentList.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  {searchKeyword.trim()
                    ? "검색 결과가 없습니다."
                    : "등록된 학생이 없습니다."}
                </td>
              </tr>
            ) : (
              filteredStudentList.map((item) => (
                <tr key={item.id}>
                  <td>{item.studentName}</td>
                  <td>{item.makeupCount}</td>
                  <td>{item.recentAbsence}</td>
                  <td>
                    <Condition status={item.makeupStatus} />
                  </td>
                  <td>{item.makeupDaysNeeded}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
