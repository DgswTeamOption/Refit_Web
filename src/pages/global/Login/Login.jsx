import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Button from "../../../components/Button/Button";
import Label from "../../../components/Label/Label";
import GoogleLoginButton from "../../../components/GoogleLoginButton/GoogleLoginButton";
import Signup from "../Signup/Signup";
import PersonalInfo from "../PersonalInfo/PersonalInfo";
import FaQ from "../FaQ/FaQ";
import TermsOf from "../TermsOf/TermsOf";
import GlobalNavigation from "../../../components/GlobalNavigation/GlobalNavigation";
import "./Login.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function LoginScreen({ onNavigate }) {
  const [codeSent, setCodeSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!codeSent || secondsLeft === 0) return undefined;

    const timer = window.setTimeout(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [codeSent, secondsLeft]);

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const requestCode = () => {
    const email = document.getElementById("email")?.value.trim() ?? "";

    if (!email.includes("@")) {
      setMessage("이메일 주소를 확인해 주세요.");
      return;
    }

    setCodeSent(true);
    setSecondsLeft(300);
    setMessage("인증코드를 보냈어요. 메일함을 확인해주세요.");
  };

  const submitLogin = () => {
    const email = document.getElementById("email")?.value.trim() ?? "";
    const code = document.getElementById("code")?.value.trim() ?? "";

    if (!email.includes("@") || !code) {
      setMessage("이메일과 인증코드를 입력해 주세요.");
      return;
    }

    onNavigate("personal-info");
  };

  return (
    <div className="LoginPage">
      <div className="LoginWrap">
        <img src="/logo.svg" alt="로고" className="logoImg" />
        <div className="LoginTextWrap">
          <div className="LoginHead">로그인</div>
          <div className="LoginText">리핏을 사용하려면 로그인하세요</div>
        </div>

        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLoginButton />
        </GoogleOAuthProvider>

        <div className="LoginLine">또는</div>
        <Label
          LabelText="이메일"
          width={290}
          placeHolder="example@email.com"
          id="email"
          type="email"
          inputButton={
            <span className="login-code-button">
              <Button text="인증코드 받기" color="blue" onClick={requestCode} />
            </span>
          }
        />
        {message && <p className="login-feedback" role="status">{message}</p>}
        <div className={`login-code-field ${codeSent ? "is-sent" : ""}`}>
          <Label
            LabelText="인증코드"
            placeHolder="6자리 숫자 입력"
            id="code"
            type="text"
          />
          {codeSent && <span className="login-code-countdown">{formattedTime}</span>}
        </div>
        {codeSent && (
          <p className="login-code-helper">
            5분 안에 입력해 주세요. 메일이 없다면 스팸함을 확인해 주세요.
          </p>
        )}
        <div className="login-actions">
          <Button text="로그인" width={400} onClick={submitLogin} />
          <p>계정이 없나요? <button type="button" onClick={() => onNavigate("signup")}>회원가입</button></p>
        </div>
        <GlobalNavigation onNavigate={onNavigate} />
      </div>
      <img src="/Refit.github.webp" alt="" className="LoginImg" />
    </div>
  );
}

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get("page") || "login";

  const navigateTo = (nextPage) => {
    setSearchParams(nextPage === "login" ? {} : { page: nextPage });
    window.scrollTo({ top: 0 });
  };

  if (page === "signup") return <Signup onNavigate={navigateTo} />;
  if (page === "personal-info") return <PersonalInfo onNavigate={navigateTo} />;
  if (page === "faq") return <FaQ onNavigate={navigateTo} />;
  if (page === "terms" || page === "privacy") {
    return <TermsOf documentType={page} onNavigate={navigateTo} />;
  }

  return <LoginScreen onNavigate={navigateTo} />;
}
