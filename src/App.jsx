import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

const Login = lazy(() => import("./pages/global/Login/Login.jsx"));
const Signup = lazy(() => import("./pages/global/Signup/Signup.jsx"));
const PersonalInfo = lazy(() => import("./pages/global/PersonalInfo/PersonalInfo.jsx"));
const FaQ = lazy(() => import("./pages/global/FaQ/FaQ.jsx"));
const TermsOf = lazy(() => import("./pages/global/TermsOf/TermsOf.jsx"));

const legacyPages = {
  login: "/login",
  signup: "/signup",
  "personal-info": "/personal-info",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
};

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
  return <Navigate to={legacyPages[requestedPage] ?? "/login"} replace />;
}

const LoginRoute = withNavigation(Login);
const SignupRoute = withNavigation(Signup);
const PersonalInfoRoute = withNavigation(PersonalInfo);
const FaQRoute = withNavigation(FaQ);
const TermsRoute = withNavigation(TermsOf);
const PrivacyRoute = withNavigation(TermsOf, { documentType: "privacy" });

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LegacyRedirect />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/signup" element={<SignupRoute />} />
        <Route path="/personal-info" element={<PersonalInfoRoute />} />
        <Route path="/faq" element={<FaQRoute />} />
        <Route path="/terms" element={<TermsRoute />} />
        <Route path="/privacy" element={<PrivacyRoute />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
