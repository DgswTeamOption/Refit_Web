import { useState } from "react";
import Button from "../../../components/Button/Button";
import Label from "../../../components/Label/Label";
import GoogleLoginButton from "../../../components/GoogleLoginButton/GoogleLoginButton";
import AuthLayout from "../../../components/AuthLayout/AuthLayout";
import GlobalNavigation from "../../../components/GlobalNavigation/GlobalNavigation";
import { authApiRequest, resolveAuthenticatedUser, saveAuthSession } from "../../../utils/auth";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
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

  async function signInWithSession(loginResponse) {
    const user = await resolveAuthenticatedUser(loginResponse);
    saveAuthSession(user);
    onNavigate(user.role);
  }

  async function handleGoogleIdToken(idToken) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      const loginResponse = await authApiRequest("/api/auth/google/login", {
        body: { idToken },
      });
      await signInWithSession(loginResponse);
    } catch (error) {
      setMessage(error.status === 401
        ? "Google 인증 토큰을 서버가 거부했습니다. 서버가 허용하는 Google Client ID 목록을 확인해 주세요."
        : error.message || "Google 로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitLogin() {
    const normalizedEmail = email.trim();
    const normalizedCode = code.trim();
    if (!normalizedEmail.includes("@") || !normalizedCode) {
      setMessage("이메일과 인증코드를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const loginResponse = await authApiRequest("/api/auth/login", {
        body: {
          email_id: normalizedEmail,
          verificationToken: normalizedCode,
        },
      });
      await signInWithSession(loginResponse);
    } catch (error) {
      setMessage(error.message || "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="login-form-content">
        <h1 className="auth-heading">로그인</h1>

        <GoogleLoginButton
          onIdToken={handleGoogleIdToken}
          onError={(error) => setMessage(error.message)}
        />

        <div className="auth-divider">또는</div>
        <Label
          LabelText="이메일"
          size="compact"
          width={280}
          placeHolder="example@email.com"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          inputButton={
            <span className="auth-code-button">
              <Button
                text={isSendingCode ? "전송 중..." : "인증코드 받기"}
                color="blue"
                width={110}
                size="compact"
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
          id="code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div className="auth-actions">
          <Button
            text={isSubmitting ? "로그인 중..." : "로그인"}
            width={420}
            size="compact"
            onClick={submitLogin}
            disabled={isSubmitting || isSendingCode}
          />
          <p>
            계정이 없나요? <button type="button" onClick={() => onNavigate("signup")}>회원가입</button>
          </p>
        </div>
      </div>
      <GlobalNavigation onNavigate={onNavigate} />
    </AuthLayout>
  );
}
