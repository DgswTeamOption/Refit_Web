import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout.jsx';
import FaQ from './pages/global/FaQ/FaQ.jsx';
import Login from './pages/global/Login/Login.jsx';
import PersonalInfo from './pages/global/PersonalInfo/PersonalInfo.jsx';
import Signup from './pages/global/Signup/Signup.jsx';
import TermsOf from './pages/global/TermsOf/TermsOf.jsx';
import StudentClass from './pages/student/Class/Class.jsx';
import StudentOverview from './pages/student/Overview/Overview.jsx';
import TeacherClass from './pages/teacher/Class/Class.jsx';
import TeacherHome from './pages/teacher/Home/Home.jsx';
import TeacherOverview from './pages/teacher/Overview/Overview.jsx';

const PAGE_PATHS = {
    login: '/login',
    signup: '/signup',
    'personal-info': '/personal-info',
    faq: '/faq',
    terms: '/terms',
    privacy: '/privacy',
};

const LEGACY_PAGE_PATHS = {
    login: PAGE_PATHS.login,
    signup: PAGE_PATHS.signup,
    'personal-info': PAGE_PATHS['personal-info'],
    faq: PAGE_PATHS.faq,
    terms: PAGE_PATHS.terms,
    privacy: PAGE_PATHS.privacy,
    student: '/student',
    teacher: '/teacher',
    memo: '/memo',
};

function useNavigatePage() {
    const navigate = useNavigate();
    return (page) => navigate(PAGE_PATHS[page] ?? '/login');
}

function LegacyRedirect() {
    const { search, hash } = useLocation();
    const legacyPage = new URLSearchParams(search).get('page');
    const destination = LEGACY_PAGE_PATHS[legacyPage] ?? (
        hash === '#class/english1' ? '/teacher/class/english1' : '/login'
    );

    return <Navigate to={destination} replace />;
}

function LoginRoute() {
    return <Login onNavigate={useNavigatePage()} />;
}

function SignupRoute() {
    return <Signup onNavigate={useNavigatePage()} />;
}

function PersonalInfoRoute() {
    return <PersonalInfo onNavigate={useNavigatePage()} />;
}

function FaQRoute() {
    return <FaQ />;
}

function TermsRoute({ documentType }) {
    return <TermsOf documentType={documentType} />;
}

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<LegacyRedirect />} />
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/signup" element={<SignupRoute />} />
                <Route element={<MainLayout />}>
                    <Route path="/personal-info" element={<PersonalInfoRoute />} />
                    <Route path="/faq" element={<FaQRoute />} />
                    <Route path="/terms" element={<TermsRoute documentType="terms" />} />
                    <Route path="/privacy" element={<TermsRoute documentType="privacy" />} />
                    <Route path="/student" element={<StudentOverview />} />
                    <Route path="/class/:classId" element={<StudentClass />} />
                    <Route path="/teacher" element={<TeacherOverview />} />
                    <Route path="/teacher/class/:classId/management" element={<TeacherHome />} />
                    <Route path="/teacher/class/:classId" element={<TeacherClass />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}
