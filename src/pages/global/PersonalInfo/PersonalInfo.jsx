import { useEffect, useRef, useState } from "react";
import Button from "../../../components/Button/Button";
import Nav from "../../../components/Nav/Nav";
import {
  authApiRequest,
  fetchCurrentUserProfile,
  isAuthenticatedSession,
  logoutAuthSession,
} from "../../../utils/auth";
import "./PersonalInfo.css";

function normalizeProfile(data, fallback = {}) {
  return {
    id: data?.id ?? fallback.id ?? null,
    name: data?.name ?? fallback.name ?? "",
    email: data?.emailId ?? data?.email_id ?? data?.email ?? fallback.email ?? "",
    photo: data?.profileImageUrl ?? data?.profile_image_url ?? fallback.photo ?? "",
  };
}

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function PersonalInfo({ onNavigate }) {
  const [mode, setMode] = useState("view");
  const [profile, setProfile] = useState({ id: null, name: "", email: "", photo: "" });
  const [draftName, setDraftName] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("error");
  const [profileError, setProfileError] = useState("");
  const [isLoading, setIsLoading] = useState(() => isAuthenticatedSession());
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchCurrentUserProfile({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data) {
          setProfileError("로그인 후 내 정보를 확인할 수 있어요.");
          return;
        }
        const nextProfile = normalizeProfile(data);
        setProfile(nextProfile);
        setDraftName(nextProfile.name);
        setProfileError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setProfileError(getErrorMessage(error, "내 정보를 불러오지 못했습니다."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const startEditing = () => {
    setDraftName(profile.name);
    setPendingPhoto(null);
    setPhotoPreview("");
    setMessage("");
    setMode("edit");
  };

  const cancelEditing = () => {
    setPendingPhoto(null);
    setPhotoPreview("");
    setMessage("");
    setMode("view");
  };

  const saveChanges = async () => {
    const nextName = draftName.trim();
    if (!nextName || nextName.length > 50) {
      setMessage("이름은 1자 이상 50자 이하로 입력해 주세요.");
      setMessageKind("error");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      let nextProfile = profile;

      if (nextName !== profile.name) {
        const updatedProfile = await authApiRequest("/api/setting/username", {
          method: "PATCH",
          body: { name: nextName },
        });
        nextProfile = normalizeProfile(updatedProfile, { ...profile, name: nextName });
        setProfile(nextProfile);
      }

      if (pendingPhoto) {
        const formData = new FormData();
        formData.append("file", pendingPhoto);
        const uploadedFile = await authApiRequest("/api/files/images", {
          method: "POST",
          body: formData,
        });
        const profileImageId = Number(uploadedFile?.fileId);

        if (!Number.isSafeInteger(profileImageId) || profileImageId <= 0) {
          throw new Error("프로필 이미지 파일 ID를 받지 못했습니다.");
        }

        if (!uploadedFile?.imageUrl) {
          throw new Error("프로필 사진 주소를 받지 못했습니다.");
        }

        try {
          const updatedProfile = await authApiRequest("/api/setting/profile-image", {
            method: "PATCH",
            body: { profileImageId },
          });
          nextProfile = normalizeProfile(updatedProfile, { ...nextProfile, photo: uploadedFile.imageUrl });
          setProfile(nextProfile);
        } catch (error) {
          if (uploadedFile.fileId != null) {
            try {
              await authApiRequest(`/api/files/${uploadedFile.fileId}`, { method: "DELETE" });
            } catch {
              // Keep the profile update error as the visible message.
            }
          }
          throw error;
        }
      }

      if (nextProfile.name) {
        localStorage.setItem("userName", nextProfile.name);
      }
      setDraftName(nextProfile.name);
      setPendingPhoto(null);
      setPhotoPreview("");
      setMessage("내 정보가 저장되었습니다.");
      setMessageKind("success");
      setMode("view");
    } catch (error) {
      setMessage(getErrorMessage(error, "정보를 저장하지 못했습니다."));
      setMessageKind("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일을 선택해 주세요.");
      setMessageKind("error");
      event.target.value = "";
      return;
    }

    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
    event.target.value = "";
  };

  const requestDeleteCode = async () => {
    if (!profile.email) {
      setMessage("계정 이메일을 확인할 수 없습니다.");
      setMessageKind("error");
      return;
    }

    setIsSendingCode(true);
    setMessage("");
    try {
      await authApiRequest("/api/user/email/send-code", {
        method: "POST",
        body: { email_id: profile.email },
      });
      setIsCodeSent(true);
      setMessage("인증코드를 보냈어요. 메일함을 확인해 주세요.");
      setMessageKind("success");
    } catch (error) {
      setMessage(getErrorMessage(error, "인증코드를 보내지 못했습니다."));
      setMessageKind("error");
    } finally {
      setIsSendingCode(false);
    }
  };

  const deleteAccount = async () => {
    if (!isCodeSent || !verificationCode.trim() || confirmation !== "계정 삭제") {
      setMessage("인증코드를 받은 뒤 코드와 확인 문구를 입력해 주세요.");
      setMessageKind("error");
      return;
    }
    if (profile.id == null) {
      setMessage("계정 ID를 확인할 수 없습니다. 다시 로그인해 주세요.");
      setMessageKind("error");
      return;
    }

    setIsDeleting(true);
    setMessage("");
    try {
      const verification = await authApiRequest("/api/user/email/verify-code", {
        method: "POST",
        body: {
          email_id: profile.email,
          verification_code: verificationCode.trim(),
        },
      });

      if (!verification?.is_verification) {
        throw new Error("인증코드가 올바르지 않습니다.");
      }

      await authApiRequest(`/api/users/${profile.id}`, { method: "DELETE" });
      await logoutAuthSession();
      onNavigate?.("login");
    } catch (error) {
      setMessage(getErrorMessage(error, "계정을 삭제하지 못했습니다."));
      setMessageKind("error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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

      {isLoading && <p className="personal-request-state" role="status">내 정보를 불러오는 중...</p>}

      {!isLoading && profileError && (
        <div className="personal-request-state" role="alert">
          <p>{profileError}</p>
          <Button text="로그인" width={120} onClick={() => onNavigate?.("login")} />
        </div>
      )}

      {!isLoading && !profileError && mode === "view" && (
        <section className="personal-view" aria-label="내 정보">
          <div className="personal-photo-column">
            <div className="personal-photo-circle">
              {profile.photo ? <img src={profile.photo} alt="프로필 사진" /> : <span>사진</span>}
            </div>
          </div>
          <div className="personal-values">
            <div className="personal-value-row">
              <span>이름</span>
              <strong>{profile.name}</strong>
            </div>
            <div className="personal-value-row">
              <span>이메일</span>
              <p>{profile.email}</p>
            </div>
            <div className="personal-button-wrap">
              <Button text="정보 수정" width={150} color="lightGray" onClick={startEditing} />
              <Button
                text="계정 삭제"
                width={150}
                color="red"
                onClick={() => {
                  setMessage("");
                  setVerificationCode("");
                  setConfirmation("");
                  setIsCodeSent(false);
                  setMode("delete");
                }}
              />
            </div>
            {message && <p className={`personal-form-message ${messageKind}`} role="status">{message}</p>}
          </div>
        </section>
      )}

      {!isLoading && !profileError && mode === "edit" && (
        <section className="personal-view personal-edit-view" aria-label="정보 수정">
          <div className="personal-photo-column">
            <button
              className="personal-photo-select"
              type="button"
              aria-label="프로필 사진 선택"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview || profile.photo
                ? <img src={photoPreview || profile.photo} alt="프로필 사진 미리보기" />
                : <span>사진 선택</span>}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} hidden />
          </div>
          <div className="personal-values">
            <label className="personal-value-row personal-edit-row">
              <span>이름</span>
              <input
                className="personal-value-input"
                value={draftName}
                maxLength={50}
                onChange={(event) => setDraftName(event.target.value)}
              />
            </label>
            <div className="personal-value-row">
              <span>이메일</span>
              <p>{profile.email}</p>
            </div>
            <div className="personal-button-wrap">
              <Button text={isSaving ? "저장 중..." : "저장"} width={150} onClick={saveChanges} disabled={isSaving} />
              <Button text="취소" width={150} color="lightGray" onClick={cancelEditing} disabled={isSaving} />
            </div>
            {message && <p className={`personal-form-message ${messageKind}`} role="status">{message}</p>}
          </div>
        </section>
      )}

      {!isLoading && !profileError && mode === "delete" && (
        <section className="personal-delete-form" aria-labelledby="delete-heading">
          <h2 id="delete-heading">정말 계정을 삭제하시겠어요?</h2>
          <p className="delete-description">계정을 삭제하면 복구할 수 없습니다.</p>
          <label className="delete-email-field">
            이메일 입력
            <span>
              <input type="email" value={profile.email} readOnly />
              <Button
                text={isSendingCode ? "전송 중..." : isCodeSent ? "인증코드 재전송" : "인증코드 보내기"}
                width={160}
                onClick={requestDeleteCode}
                disabled={isSendingCode || isDeleting}
              />
            </span>
          </label>
          <label>
            인증코드 입력
            <input
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              placeholder="인증코드 입력"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </label>
          <label>
            확인을 위해 “계정 삭제”를 입력해주세요
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="계정 삭제" />
          </label>
          {message && <p className={`personal-form-message ${messageKind}`} role="status">{message}</p>}
          <div className="personal-form-actions">
            <Button
              text={isDeleting ? "삭제 중..." : "정말 탈퇴하시겠어요?"}
              width={170}
              color="red"
              onClick={deleteAccount}
              disabled={isDeleting || isSendingCode}
            />
            <Button
              text="취소"
              width={120}
              color="lightGray"
              onClick={() => { setMessage(""); setMode("view"); }}
              disabled={isDeleting}
            />
          </div>
        </section>
      )}
    </main>
  );
}
