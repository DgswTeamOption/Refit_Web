import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import GlobalNavigation from "./components/GlobalNavigation/GlobalNavigation.jsx";

const Login = lazy(() => import("./pages/global/Login/Login.jsx"));
const Signup = lazy(() => import("./pages/global/Signup/Signup.jsx"));
const PersonalInfo = lazy(() => import("./pages/global/PersonalInfo/PersonalInfo.jsx"));
const FaQ = lazy(() => import("./pages/global/FaQ/FaQ.jsx"));
const TermsOf = lazy(() => import("./pages/global/TermsOf/TermsOf.jsx"));
const Introduce = lazy(() => import("./pages/global/Introduce/Introduce.jsx"));
const StudentOverview = lazy(() => import("./pages/student/Overview/Overview.jsx"));
const StudentClass = lazy(() => import("./pages/student/Class/Class.jsx"));

const legacyPages = {
  login: "/login",
  signup: "/signup",
  "personal-info": "/personal-info",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
  introduce: "/introduce",
  "service-intro": "/introduce",
  student: "/student",
  overview: "/student",
};

/**
 * 페이지 라우트 이동 시 항상 화면 최상단(0, 0)으로 스크롤 이동
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function withNavigation(Page, pageProps = {}) {
  return function RoutedPage() {
    const navigate = useNavigate();
    const onNavigate = (page) => navigate(legacyPages[page] ?? "/login");

    return <Page {...pageProps} onNavigate={onNavigate} />;
  };
}

function LegacyRedirect() {
  const { search } = useLocation();
  const requestedPage = new URLSearchParams(search).get("page");
  if (requestedPage) {
    return <Navigate to={legacyPages[requestedPage] ?? "/login"} replace />;
  }
  // npm run dev 실행 후 첫 진입(/) 시 항상 로그인 화면이 먼저 나타나도록 설정
  return <Navigate to="/login" replace />;
}

function StudentLayout({ children }) {
  const navigate = useNavigate();
  const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "학생1";
  const onNavigate = (page) => navigate(legacyPages[page] ?? "/login");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <Header
        isLoggedIn={true}
        userName={userName}
        onLogoClick={() => navigate("/student")}
        onLogoutClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
        }}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <GlobalNavigation variant="footer" onNavigate={onNavigate}>
        <Footer />
      </GlobalNavigation>
    </div>
  );
}

function StudentOverviewRoute() {
  return (
    <StudentLayout>
      <StudentOverview />
    </StudentLayout>
  );
}

function StudentClassRoute() {
  return (
    <StudentLayout>
      <StudentClass />
    </StudentLayout>
  );
}

const LoginRoute = withNavigation(Login);
const SignupRoute = withNavigation(Signup);
const PersonalInfoRoute = withNavigation(PersonalInfo);
const FaQRoute = withNavigation(FaQ);
const TermsRoute = withNavigation(TermsOf);
const PrivacyRoute = withNavigation(TermsOf, { documentType: "privacy" });
const IntroduceRoute = withNavigation(Introduce);

export default function App() {
  return (
    <Suspense fallback={null}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LegacyRedirect />} />
        <Route path="/student" element={<StudentOverviewRoute />} />
        <Route path="/class/:classId" element={<StudentClassRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={<SignupRoute />} />
        <Route path="/personal-info" element={<PersonalInfoRoute />} />
        <Route path="/faq" element={<FaQRoute />} />
        <Route path="/terms" element={<TermsRoute />} />
        <Route path="/privacy" element={<PrivacyRoute />} />
        <Route path="/introduce" element={<IntroduceRoute />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
