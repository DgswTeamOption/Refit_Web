import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  getMakeupAvailabilities,
  deleteMakeupAvailability,
} from "../../../../api/overviewApi";

function normalizeValidId(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return "";
  return str;
}

function parseLocalDateAndTime(rawDateTime) {
  if (!rawDateTime) return { date: "", time: "" };
  const str = String(rawDateTime).trim();
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) {
    const dt = new Date(str);
    if (!Number.isNaN(dt.getTime())) {
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      const hh = String(dt.getHours()).padStart(2, "0");
      const min = String(dt.getMinutes()).padStart(2, "0");
      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
    }
  }
  const dMatch = str.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  const tMatch = str.match(/(\d{1,2}:\d{2})/);
  return {
    date: dMatch
      ? `${dMatch[1]}-${dMatch[2].padStart(2, "0")}-${dMatch[3].padStart(2, "0")}`
      : "",
    time: tMatch
      ? `${tMatch[1].split(":")[0].padStart(2, "0")}:${tMatch[1].split(":")[1]}`
      : "",
  };
}

function formatKoreanMonthDay(date) {
  if (!date) return "-";
  const match = String(date).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return match ? `${Number(match[2])}월 ${Number(match[3])}일` : date;
}

function mapAvailabilityItem(item, index) {
  const rawMakeup =
    item?.makeup_time ??
    item?.makeupTime ??
    item?.start_time ??
    item?.startTime;
  const { date, time } = parseLocalDateAndTime(rawMakeup);
  const rawEnd = item?.end_time ?? item?.endTime;
  const { time: endTime } = parseLocalDateAndTime(rawEnd);

  return {
    id:
      item?.id ??
      item?.availabilityId ??
      item?.availability_id ??
      item?.makeupAvailabilityId ??
      index,
    date,
    startTime: time,
    endTime,
  };
}

function SettingTable({ availableList, loading, error, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="setting-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>시작 시간</th>
            <th>종료 시간</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>보강 가능 시간을 불러오는 중입니다.</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={4}>{error}</td>
            </tr>
          ) : availableList.length === 0 ? (
            <tr>
              <td colSpan={4}>등록된 보강 가능 시간이 없습니다.</td>
            </tr>
          ) : (
            availableList.map((item) => (
              <tr key={item.id}>
                <td>{formatKoreanMonthDay(item.date)}</td>
                <td>{item.startTime || "-"}</td>
                <td>{item.endTime || "-"}</td>
                <td>
                  <div className="action-buttons">
                    <Button text="수정" color="lightGray" width={60} onClick={() => onEdit(item)} />
                    <Button text="삭제" color="red" width={60} onClick={() => onDelete(item.id)} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function MakeupSettingTab({ classId, classroomId }) {
  const params = useParams();
  const resolvedClassId =
    normalizeValidId(classId) ||
    normalizeValidId(classroomId) ||
    normalizeValidId(params.classId ?? params.classroomId ?? params.id);

  const [editingId, setEditingId] = useState(null);
  const [settingDate, setSettingDate] = useState("");
  const [settingStartTime, setSettingStartTime] = useState("");
  const [settingEndTime, setSettingEndTime] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [availableList, setAvailableList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchAvailabilities = useCallback(async () => {
    if (!resolvedClassId) {
      setAvailableList([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const classIdNumber = Number(resolvedClassId);
      const availabilityRes = await getMakeupAvailabilities({
        class_id: Number.isNaN(classIdNumber) ? resolvedClassId : classIdNumber,
      });
      const list = Array.isArray(availabilityRes)
        ? availabilityRes
        : availabilityRes?.availabilities ||
          availabilityRes?.content ||
          availabilityRes?.items ||
          availabilityRes?.list ||
          [];
      setAvailableList(list.map(mapAvailabilityItem));
    } catch (err) {
      setError(err.message || "보강 가능 시간을 불러오지 못했습니다.");
      setAvailableList([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedClassId]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const handleCancelForm = () => {
    setEditingId(null);
    setSettingDate("");
    setSettingStartTime("");
    setSettingEndTime("");
    setSaveMessage("");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSettingDate(item.date);
    setSettingStartTime(item.startTime);
    setSettingEndTime(item.endTime || "");
    setSaveMessage("");
  };

  const handleSave = () => {
    setSaveMessage("");
    if (!settingDate || !settingStartTime || !settingEndTime) {
      setSaveMessage("날짜와 시작 시간, 종료 시간을 모두 입력해주세요.");
      return;
    }
    if (settingEndTime <= settingStartTime) {
      setSaveMessage("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }
    setSaveMessage(
      "현재 API는 수업 일정(schedule_id)과 시작 시각(makeup_time)을 요구하지만 종료 시간 필드는 없습니다. 수업 연결 방식과 종료 시간 저장을 백엔드에서 지원해야 등록할 수 있습니다."
    );
  };

  const handleDelete = async (id) => {
    setActionError("");
    try {
      await deleteMakeupAvailability(id);
      setAvailableList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setActionError(err.message || "보강 가능 시간 삭제에 실패했습니다.");
    }
  };

  return (
    <>
      <section className="form-section">
        <h2 className="form-title">보강 가능 시간</h2>
        <div className="form-row">
          <div className="form-group">
            <label>날짜</label>
            <input
              type="date"
              value={settingDate}
              onChange={(e) => {
                setSettingDate(e.target.value);
                setSaveMessage("");
              }}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>시작 시간</label>
            <input
              type="time"
              value={settingStartTime}
              onChange={(e) => {
                setSettingStartTime(e.target.value);
                setSaveMessage("");
              }}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>종료 시간</label>
            <input
              type="time"
              value={settingEndTime}
              onChange={(e) => {
                setSettingEndTime(e.target.value);
                setSaveMessage("");
              }}
              className="form-control"
            />
          </div>
          <div className="form-submit" style={{ display: "flex", gap: "8px" }}>
            <Button text={editingId !== null ? "수정" : "저장"} color="blue" width={90} onClick={handleSave} />
            {editingId !== null && (
              <Button text="취소" color="lightGray" width={80} onClick={handleCancelForm} />
            )}
          </div>
        </div>
        {saveMessage && (
          <p role="status" className="makeup-setting-notice">
            {saveMessage}
          </p>
        )}
      </section>

      <section className="list-section">
        <h2 className="section-title">등록된 가능 시간</h2>
        {actionError && (
          <p role="alert" className="makeup-setting-notice">
            {actionError}
          </p>
        )}
        <SettingTable
          availableList={availableList}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </>
  );
}
