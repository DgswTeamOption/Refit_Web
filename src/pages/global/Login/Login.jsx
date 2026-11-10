import { useState } from "react";
import Button from "../../../components/Button/Button";
import Label from "../../../components/Label/Label";
import GoogleLoginButton from "../../../components/GoogleLoginButton/GoogleLoginButton";
import AuthLayout from "../../../components/AuthLayout/AuthLayout";
import GlobalNavigation from "../../../components/GlobalNavigation/GlobalNavigation";
import "./Login.css";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const requestCode = () => {
    if (!email.includes("@")) {
      setMessage("이메일 주소를 확인해 주세요.");
      return;
    }

    setMessage("인증코드를 보냈어요. 메일함을 확인해주세요.");
  };

  const submitLogin = () => {
    if (!email.includes("@") || !code) {
      setMessage("이메일과 인증코드를 입력해 주세요.");
      return;
    }

    onNavigate("personal-info");
  };

  return (
    <AuthLayout>
        <div className="LoginTextWrap">
          <div className="LoginHead">로그인</div>
          <div className="LoginText">리핏을 사용하려면 로그인하세요</div>
        </div>

        <GoogleLoginButton />

        <div className="LoginLine">또는</div>
        <Label
          LabelText="이메일"
          width={420}
          placeHolder="example@email.com"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          inputButton={
            <span className="login-code-button">
              <Button text="인증코드 받기" color="blue" width={120} onClick={requestCode} />
            </span>
          }
        />
        {message && <p className="login-feedback" role="status">{message}</p>}
        <Label
          LabelText="인증코드"
          placeHolder="6자리 숫자 입력"
          id="code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div className="login-actions">
          <Button text="로그인" width={550} onClick={submitLogin} />
          <p>계정이 없나요? <button type="button" onClick={() => onNavigate("signup")}>회원가입</button></p>
        </div>
        <GlobalNavigation onNavigate={onNavigate} />
    </AuthLayout>
  );
}
