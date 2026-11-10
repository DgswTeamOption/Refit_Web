import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout.jsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';
import StudentLayout from './components/StudentLayout/StudentLayout.jsx';

const FaQ = lazy(() => import('./pages/global/FaQ/FaQ.jsx'));
const Introduce = lazy(() => import('./pages/global/Introduce/Introduce.jsx'));
const Login = lazy(() => import('./pages/global/Login/Login.jsx'));
const PersonalInfo = lazy(() => import('./pages/global/PersonalInfo/PersonalInfo.jsx'));
const Signup = lazy(() => import('./pages/global/Signup/Signup.jsx'));
const TermsOf = lazy(() => import('./pages/global/TermsOf/TermsOf.jsx'));
const StudentClass = lazy(() => import('./pages/student/Class/Class.jsx'));
const StudentOverview = lazy(() => import('./pages/student/Overview/Overview.jsx'));
const TeacherClass = lazy(() => import('./pages/teacher/Class/Class.jsx'));
const TeacherHome = lazy(() => import('./pages/teacher/Home/Home.jsx'));
const TeacherOverview = lazy(() => import('./pages/teacher/Overview/Overview.jsx'));

const PAGE_PATHS = {
    login: '/login',
    signup: '/signup',
    'personal-info': '/personal-info',
    faq: '/faq',
    terms: '/terms',
    privacy: '/privacy',
    introduce: '/introduce',
    'service-intro': '/introduce',
};

const LEGACY_PAGE_PATHS = {
    ...PAGE_PATHS,
    student: '/student',
    teacher: '/teacher',
    memo: '/memo',
};

function LegacyRedirect() {
    const { search, hash } = useLocation();
    const legacyPage = new URLSearchParams(search).get('page');
    const destination = LEGACY_PAGE_PATHS[legacyPage] ?? (
        hash === '#class/english1' ? '/teacher/class/english1' : '/login'
    );

    return <Navigate to={destination} replace />;
}

export default function App() {
    const navigate = useNavigate();
    const onNavigate = (page) => navigate(PAGE_PATHS[page] ?? '/login');

    return (
        <Suspense fallback={null}>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<LegacyRedirect />} />
                <Route path="/login" element={<Login onNavigate={onNavigate} />} />
                <Route path="/signup" element={<Signup onNavigate={onNavigate} />} />

                <Route element={<StudentLayout />}>
                    <Route path="/student" element={<StudentOverview />} />
                    <Route path="/class/:classId" element={<StudentClass />} />
                </Route>

                <Route element={<MainLayout />}>
                    <Route path="/personal-info" element={<PersonalInfo onNavigate={onNavigate} />} />
                    <Route path="/faq" element={<FaQ />} />
                    <Route path="/terms" element={<TermsOf documentType="terms" />} />
                    <Route path="/privacy" element={<TermsOf documentType="privacy" />} />
                    <Route path="/introduce" element={<Introduce />} />
                    <Route path="/teacher" element={<TeacherOverview />} />
                    <Route path="/teacher/class/:classId/management" element={<TeacherHome />} />
                    <Route path="/teacher/class/:classId" element={<TeacherClass />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
}
