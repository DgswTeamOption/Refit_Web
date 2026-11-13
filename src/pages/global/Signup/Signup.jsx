import { useState } from "react";
import Button from "../../../components/Button/Button";
import Label from "../../../components/Label/Label";
import GoogleLoginButton from "../../../components/GoogleLoginButton/GoogleLoginButton";
import AuthLayout from "../../../components/AuthLayout/AuthLayout";
import studentIcon from "../../../assets/Vector.svg";
import teacherIcon from "../../../assets/Book.svg";
import GlobalNavigation from "../../../components/GlobalNavigation/GlobalNavigation";
import "../Login/Login.css";
import "./Signup.css";

export default function Signup({ onNavigate }) {
  const [step, setStep] = useState("information");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const requestCode = () => {
    if (!email.trim().includes("@")) {
      setMessage("이메일 주소를 확인해 주세요.");
      return;
    }

    setMessage("인증코드를 보냈어요. 메일함을 확인해주세요.");
  };

  const continueToRole = () => {
    if (!name.trim() || !email.trim().includes("@") || !code.trim()) {
      setMessage("이름, 이메일, 인증코드를 입력해 주세요.");
      return;
    }

    setMessage("");
    setStep("role");
  };

  const completeSignup = () => {
    if (role === "student") {
      localStorage.setItem("token", "student-auth-token");
      localStorage.setItem("role", "student");
      localStorage.setItem("userName", name.trim() || "학생1");
      onNavigate("student");
    } else {
      localStorage.setItem("token", "teacher-auth-token");
      localStorage.setItem("role", "teacher");
      onNavigate("login");
    }
  };

  return (
    <AuthLayout className={`SignupPage ${step === "role" ? "is-role-selection" : ""}`}>
        {step === "information" ? (
          <div className="signup-information">
            <div className="LoginTextWrap">
              <div className="LoginHead">회원가입</div>
              <div className="LoginText">이메일 인증을 통하여 가입하세요.</div>
            </div>

            <GoogleLoginButton />

            <div className="LoginLine">또는</div>
            <Label LabelText="이름" width={550} placeHolder="이름을 입력해주세요" id="signup-name" value={name} onChange={(event) => setName(event.target.value)} />
            <Label
              LabelText="이메일"
              width={420}
              placeHolder="example@email.com"
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              inputButton={
                <span className="signup-code-button">
                  <Button text="인증코드 받기" width={120} color="blue" onClick={requestCode} />
                </span>
              }
            />
            <p className="signup-feedback" role="status">{message}</p>
            <Label LabelText="인증코드" width={550} placeHolder="6자리 숫자 입력" id="signup-code" value={code} onChange={(event) => setCode(event.target.value)} />

            <div className="signup-actions">
              <Button text="회원가입" width={550} onClick={continueToRole} />
              <p>이미 계정이 있나요? <button type="button" onClick={() => onNavigate("login")}>로그인</button></p>
            </div>
            <GlobalNavigation onNavigate={onNavigate} />
          </div>
        ) : (
          <div className="signup-role">
            <div className="LoginTextWrap">
              <div className="LoginHead">역할 선택</div>
              <div className="LoginText">리핏 사용을 위해서 역할을 선택하세요</div>
            </div>

            <div className="signup-role-options" role="group" aria-label="회원 역할">
              <button
                type="button"
                className={`signup-role-card ${role === "student" ? "selected" : ""}`}
                aria-pressed={role === "student"}
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
                onClick={() => setRole("teacher")}
              >
                <img src={teacherIcon} alt="" />
                <strong>선생님</strong>
                <span>수업을 만들고<br />출석·보강을 관리해요</span>
              </button>
            </div>

            <Button text="시작하기" width={550} onClick={completeSignup} />
            <GlobalNavigation onNavigate={onNavigate} />
          </div>
        )}
    </AuthLayout>
  );
}
