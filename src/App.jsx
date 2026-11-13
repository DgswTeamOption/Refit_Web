import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import StudentLayout from "./components/StudentLayout/StudentLayout.jsx";

const Login = lazy(() => import("./pages/global/Login/Login.jsx"));
const Signup = lazy(() => import("./pages/global/Signup/Signup.jsx"));
const PersonalInfo = lazy(() => import("./pages/global/PersonalInfo/PersonalInfo.jsx"));
const FaQ = lazy(() => import("./pages/global/FaQ/FaQ.jsx"));
const TermsOf = lazy(() => import("./pages/global/TermsOf/TermsOf.jsx"));
const Introduce = lazy(() => import("./pages/global/Introduce/Introduce.jsx"));
const StudentOverview = lazy(() => import("./pages/student/Overview/Overview.jsx"));
const StudentClass = lazy(() => import("./pages/student/Class/Class.jsx"));

export default function App() {
  const navigate = useNavigate();
  const onNav = (page) => navigate(`/${page}`);

  return (
    <Suspense fallback={null}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 학생 화면 레이아웃 */}
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentOverview />} />
          <Route path="/class/:classId" element={<StudentClass />} />
        </Route>

        {/* 글로벌 및 회원 인증 화면 */}
        <Route path="/login" element={<Login onNavigate={onNav} />} />
        <Route path="/signup" element={<Signup onNavigate={onNav} />} />
        <Route path="/personal-info" element={<PersonalInfo onNavigate={onNav} />} />
        <Route path="/faq" element={<FaQ onNavigate={onNav} />} />
        <Route path="/terms" element={<TermsOf onNavigate={onNav} />} />
        <Route path="/privacy" element={<TermsOf documentType="privacy" onNavigate={onNav} />} />
        <Route path="/introduce" element={<Introduce onNavigate={onNav} />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
