import { useState } from "react";
import AuthLayout from "../../../components/AuthLayout/AuthLayout";
import Button from "../../../components/Button/Button";
import GlobalNavigation from "../../../components/GlobalNavigation/GlobalNavigation";
import GoogleLoginButton from "../../../components/GoogleLoginButton/GoogleLoginButton";
import Label from "../../../components/Label/Label";
import studentIcon from "../../../assets/Vector.svg";
import teacherIcon from "../../../assets/Book.svg";
import { authApiRequest, clearAuthSession, normalizeRole, saveAuthSession } from "../../../utils/auth";
import "./Signup.css";

export default function Signup({ onNavigate }) {
  const [step, setStep] = useState("information");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [googleIdToken, setGoogleIdToken] = useState("");
  const [googleSignupProfile, setGoogleSignupProfile] = useState(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestCode() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail.includes("@")) {
      setMessage("이메일 주소를 확인해 주세요.");
      return;
    }

    setIsSendingCode(true);
    setMessage("");
    try {
      await authApiRequest("/api/user/email/send-code", {
        body: { email_id: normalizedEmail },
      });
      setMessage("인증코드를 보냈어요.");
    } catch (error) {
      setMessage(error.message || "인증코드를 보내지 못했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  }

  function continueToRole() {
    if (!name.trim() || !email.trim().includes("@") || !code.trim()) {
      setMessage("이름, 이메일, 인증코드를 입력해 주세요.");
      return;
    }

    // The register endpoint validates verificationToken, so do not consume the
    // same one-time code with /verify-code before submitting registration.
    setMessage("");
    setStep("role");
  }

  function handleGoogleIdToken(idToken) {
    setGoogleIdToken(idToken);
    setGoogleSignupProfile(null);
    setMessage("");
    setStep("role");
  }

  async function completeGoogleSignup() {
    if (!googleIdToken) {
      setMessage("Google 인증을 다시 진행해 주세요.");
      setStep("information");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      let registeredProfile = googleSignupProfile;
      if (!registeredProfile) {
        try {
          registeredProfile = await authApiRequest("/api/auth/google/register", {
            body: { idToken: googleIdToken, role: role.toUpperCase() },
          });
        } catch (error) {
          if (error.status === 401) {
            setGoogleIdToken("");
            setGoogleSignupProfile(null);
            setStep("information");
            setMessage(error.message || "Google 인증을 확인하지 못했습니다. 다시 인증해 주세요.");
            return;
          }
          throw error;
        }
        setGoogleSignupProfile(registeredProfile);
      }

      await authApiRequest("/api/auth/google/login", {
        body: { idToken: googleIdToken },
      });
      const registeredRole = normalizeRole(registeredProfile?.role) || role;
      saveAuthSession({
        role: registeredRole,
        name: registeredProfile?.name || name,
        userId: registeredProfile?.id,
      });
      onNavigate(registeredRole);
    } catch (error) {
      setMessage(error.message || "Google 회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function completeEmailSignup() {
    setIsSubmitting(true);
    setMessage("");
    try {
      const data = await authApiRequest("/api/auth/register", {
        body: {
          email_id: email.trim(),
          name: name.trim(),
          role: role.toUpperCase(),
          verificationToken: code.trim(),
        },
      });

      const registeredRole = normalizeRole(data?.role);
      if (!registeredRole) throw new Error("회원 역할 정보를 받지 못했습니다.");

      // 이전 계정의 토큰/이름이 남아있지 않도록 세션 초기화 후 로그인 화면으로 이동
      clearAuthSession();
      onNavigate("login");
    } catch (error) {
      setMessage(error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function completeSignup() {
    if (googleIdToken) return completeGoogleSignup();
    return completeEmailSignup();
  }

  return (
    <AuthLayout>
      {step === "information" ? (
        <div className="signup-information">
          <div className="signup-form-content">
            <h1 className="auth-heading">회원가입</h1>
            <GoogleLoginButton
              onIdToken={handleGoogleIdToken}
              onError={(error) => setMessage(error.message)}
            />
            <div className="auth-divider">또는</div>
            <Label
              LabelText="이름"
              size="compact"
              width={420}
              placeHolder="이름을 입력해주세요"
              id="signup-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Label
              LabelText="이메일"
              size="compact"
              width={280}
              placeHolder="example@email.com"
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              inputButton={
                <span className="auth-code-button">
                  <Button
                    text={isSendingCode ? "전송 중..." : "인증코드 받기"}
                    width={110}
                    size="compact"
                    color="blue"
                    onClick={requestCode}
                    disabled={isSendingCode || isSubmitting}
                  />
                </span>
              }
            />
            <p className="auth-feedback" role="status">{message}</p>
            <Label
              LabelText="인증코드"
              size="compact"
              width={420}
              placeHolder="6자리 숫자 입력"
              id="signup-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <div className="auth-actions">
              <Button
                text={isSubmitting ? "확인 중..." : "회원가입"}
                width={420}
                size="compact"
                onClick={continueToRole}
                disabled={isSubmitting || isSendingCode}
              />
              <p>
                이미 계정이 있나요? <button type="button" onClick={() => onNavigate("login")}>로그인</button>
              </p>
            </div>
          </div>
          <GlobalNavigation onNavigate={onNavigate} />
        </div>
      ) : (
        <div className="signup-role">
          <div className="signup-role-content">
            <h1 className="auth-heading">역할 선택</h1>
            <div className="signup-role-options" role="group" aria-label="회원 역할">
              <button
                type="button"
                className={`signup-role-card ${role === "student" ? "selected" : ""}`}
                aria-pressed={role === "student"}
                disabled={Boolean(googleSignupProfile)}
                onClick={() => setRole("student")}
              >
                <img src={studentIcon} alt="" />
                <strong>학생</strong>
                <span>수업에 참여하고<br />결석·보강을 신청해요</span>
              </button>
              <button
                type="button"
                className={`signup-role-card ${role === "teacher" ? "selected" : ""}`}
                aria-pressed={role === "teacher"}
                disabled={Boolean(googleSignupProfile)}
                onClick={() => setRole("teacher")}
              >
                <img src={teacherIcon} alt="" />
                <strong>선생님</strong>
                <span>수업을 만들고<br />출석·보강을 관리해요</span>
              </button>
            </div>
            <Button
              text={isSubmitting ? "가입 중..." : googleSignupProfile ? "로그인 다시 시도" : "시작하기"}
              width={420}
              size="compact"
              onClick={completeSignup}
              disabled={isSubmitting || isSendingCode}
            />
            <p className="auth-feedback" role="status">{message}</p>
            <p className="signup-role-switch">
              이미 계정이 있나요? <button type="button" onClick={() => onNavigate("login")}>로그인</button>
            </p>
          </div>
          <GlobalNavigation onNavigate={onNavigate} />
        </div>
      )}
    </AuthLayout>
  );
}
