import { useRef, useState } from "react";
import Button from "../../../components/Button/Button";
import GlobalPageLayout from "../../../components/GlobalPageLayout/GlobalPageLayout";
import Nav from "../../../components/Nav/Nav";
import "./PersonalInfo.css";

export default function PersonalInfo({ onNavigate }) {
  const [mode, setMode] = useState("view");
  const [name, setName] = useState("학생1");
  const [email, setEmail] = useState("student@email.com");
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [photo, setPhoto] = useState("");
  const [deleteEmail, setDeleteEmail] = useState(email);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const startEditing = () => {
    setDraftName(name);
    setDraftEmail(email);
    setMode("edit");
  };

  const saveChanges = () => {
    if (!draftName.trim() || !draftEmail.includes("@")) return;
    setName(draftName.trim());
    setEmail(draftEmail.trim());
    setMode("view");
  };

  const requestDeleteCode = () => {
    if (!deleteEmail.includes("@")) {
      setMessage("이메일 주소를 확인해 주세요.");
      return;
    }
    setMessage("인증코드를 보냈어요. 메일함을 확인해주세요.");
  };

  const deleteAccount = () => {
    if (!verificationCode.trim() || confirmation !== "계정 삭제") {
      setMessage("인증코드와 확인 문구를 입력해 주세요.");
      return;
    }
    onNavigate("login");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
  };

  return (
    <GlobalPageLayout onNavigate={onNavigate}>
      <main className={`personal-info-page ${mode}`}>
        <Nav
          items={[
            { text: "홈", link: "/" },
            { text: "내 정보", link: mode === "view" ? undefined : "/personal-info" },
            ...(mode === "edit" ? [{ text: "정보 수정" }] : []),
            ...(mode === "delete" ? [{ text: "계정 삭제" }] : []),
          ]}
        />

        <div className="global-page-heading">
          <h1>{mode === "view" ? "내 정보" : mode === "edit" ? "정보 수정" : "계정 삭제"}</h1>
        </div>

      {mode === "view" && (
        <section className="personal-view" aria-label="내 정보">
          <div className="personal-photo-column">
            <div className="personal-photo-circle">
              {photo ? <img src={photo} alt="프로필 사진" /> : <span>사진</span>}
            </div>
          </div>
          <div className="personal-values">
            <div className="personal-value-row">
              <span>이름</span>
              <strong>{name}</strong>
            </div>
            <div className="personal-value-row">
              <span>이메일</span>
              <p>{email}</p>
            </div>
            <div className="personal-button-wrap">
              <Button text="정보 수정" width={150} color="lightGray" onClick={startEditing} />
              <Button text="계정 삭제" width={150} color="red" onClick={() => { setDeleteEmail(email); setMode("delete"); }}/>
            </div>
          </div>
        </section>
      )}

      {mode === "edit" && (
        <section className="personal-view personal-edit-view" aria-label="정보 수정">
          <div className="personal-photo-column">
            <button
              className="personal-photo-select"
              type="button"
              aria-label="프로필 사진 선택"
              onClick={() => fileInputRef.current?.click()}
            >
              {photo ? <img src={photo} alt="선택한 프로필 사진" /> : <span>사진 선택</span>}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} hidden />
          </div>
          <div className="personal-values">
            <label className="personal-value-row personal-edit-row">
              <span>이름</span>
              <input
                className="personal-value-input"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
              />
            </label>
            <label className="personal-value-row personal-edit-row">
              <span>이메일</span>
              <input
                className="personal-value-input"
                type="email"
                value={draftEmail}
                onChange={(event) => setDraftEmail(event.target.value)}
              />
            </label>
            <div className="personal-button-wrap">
              <Button text="저장" width={150} onClick={saveChanges} />
              <Button text="취소" width={150} color="lightGray" onClick={() => setMode("view")} />
            </div>
          </div>
        </section>
      )}

        {mode === "delete" && (
        <section className="personal-delete-form" aria-labelledby="delete-heading">
          <h2 id="delete-heading">정말 계정을 삭제하시겠어요?</h2>
          <p className="delete-description">계정을 삭제하면 복구할 수 없습니다.</p>
          <label className="delete-email-field">
            이메일 입력
            <span>
              <input type="email" placeholder="이메일 입력" value={deleteEmail} onChange={(event) => setDeleteEmail(event.target.value)} />
              <Button text="인증코드 보내기" width={160} onClick={requestDeleteCode} />
            </span>
          </label>
          <label>
            인증코드 입력
            <input value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} placeholder="인증코드 입력" />
          </label>
          <label>
            확인을 위해 “계정 삭제”를 입력해주세요
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="계정 삭제" />
          </label>
          {message && <p className="personal-form-message" role="status">{message}</p>}
          <div className="personal-form-actions">
            <Button text="정말 탈퇴하시겠어요?" width={170} color="red" onClick={deleteAccount} />
            <Button text="취소" width={120} color="lightGray" onClick={() => { setMessage(""); setMode("view"); }} />
          </div>
        </section>
        )}
      </main>
    </GlobalPageLayout>
  );
}
