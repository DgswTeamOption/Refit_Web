import { useState } from "react";
import Button from "../../../components/Button/Button";
import Label from "../../../components/Label/Label";
import GoogleLoginButton from "../../../components/GoogleLoginButton/GoogleLoginButton";
import AuthLayout from "../../../components/AuthLayout/AuthLayout";
import GlobalNavigation from "../../../components/GlobalNavigation/GlobalNavigation";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const requestCode = () => {
    if (!email.includes("@")) {
      setMessage("이메일 주소를 확인해 주세요.");
      return;
    }

    setMessage("인증코드를 보냈어요.");
  };

  const submitLogin = () => {
    if (!email.includes("@") || !code) {
      setMessage("이메일과 인증코드를 입력해 주세요.");
      return;
    }

    localStorage.setItem("token", "student-auth-token");
    localStorage.setItem("role", "student");
    localStorage.setItem("userName", "학생1");
    onNavigate("student");
  };

  return (
    <AuthLayout>
      <div className="login-form-content">
        <h1 className="auth-heading">로그인</h1>

        <GoogleLoginButton />

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
              <Button text="인증코드 받기" color="blue" width={110} size="compact" onClick={requestCode} />
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
          <Button text="로그인" width={420} size="compact" onClick={submitLogin} />
          <p>
            계정이 없나요? <button type="button" onClick={() => onNavigate("signup")}>회원가입</button>
          </p>
        </div>
      </div>
      <GlobalNavigation onNavigate={onNavigate} />
    </AuthLayout>
  );
}
