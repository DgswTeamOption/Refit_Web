import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout.jsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';
import StudentLayout from './components/StudentLayout/StudentLayout.jsx';

import { usePageMetadata } from './seo/usePageMetadata.js';

import { loadInitialPage } from './seo/loadInitialPage.js';

const FaQ = lazy(loadInitialPage['/faq']);
const Introduce = lazy(loadInitialPage['/']);
const Login = lazy(loadInitialPage['/login']);
const PersonalInfo = lazy(() => import('./pages/global/PersonalInfo/PersonalInfo.jsx'));
const Signup = lazy(loadInitialPage['/signup']);
const TermsOf = lazy(() => import('./pages/global/TermsOf/TermsOf.jsx'));
const StudentClass = lazy(() => import('./pages/student/Class/Class.jsx'));
const StudentOverview = lazy(() => import('./pages/student/Overview/Overview.jsx'));
const TeacherClass = lazy(() => import('./pages/teacher/Class/Class.jsx'));
const TeacherHome = lazy(() => import('./pages/teacher/Home/Home.jsx'));
const TeacherOverview = lazy(() => import('./pages/teacher/Overview/Overview.jsx'));

const PAGE_PATHS = {
    login: '/login',
    signup: '/signup',
    student: '/student',
    teacher: '/teacher',
    'personal-info': '/personal-info',
    faq: '/faq',
    terms: '/terms',
    privacy: '/privacy',
    introduce: '/',
    'service-intro': '/',
};

const LEGACY_PAGE_PATHS = {
    ...PAGE_PATHS,
    student: '/student',
    teacher: '/teacher',
    memo: '/memo',
};

function Landing({ Page }) {
    const { search, hash } = useLocation();
    const legacyPage = new URLSearchParams(search).get('page');
    const destination = Object.hasOwn(LEGACY_PAGE_PATHS, legacyPage)
        ? LEGACY_PAGE_PATHS[legacyPage]
        : hash === '#class/english1' ? '/teacher/class/english1' : '/';

    return destination === '/' ? <Page /> : <Navigate to={destination} replace />;
}

function IntroduceRedirect() {
    const { search, hash } = useLocation();
    return <Navigate to={{ pathname: '/', search, hash }} replace />;
}

function NotFound() {
    return <main><h1>페이지를 찾을 수 없습니다</h1><a href="/">서비스 소개로 이동</a></main>;
}

export default function App({ publicPage } = {}) {
    const { pathname } = useLocation();
    usePageMetadata(pathname);
    const LandingPage = publicPage?.path === '/' ? publicPage.Component : Introduce;
    const FaqPage = publicPage?.path === '/faq' ? publicPage.Component : FaQ;
    const navigate = useNavigate();
    const onNavigate = (page) => navigate(PAGE_PATHS[page] ?? '/login');

    return (
        <Suspense fallback={null}>
            <ScrollToTop />
            <Routes>
                <Route path="/login" element={<Login onNavigate={onNavigate} />} />
                <Route path="/signup" element={<Signup onNavigate={onNavigate} />} />

                <Route element={<StudentLayout />}>
                    <Route path="/student" element={<StudentOverview />} />
                    <Route path="/class/:classId" element={<StudentClass />} />
                </Route>

                <Route element={<MainLayout />}>
                    <Route path="/personal-info" element={<PersonalInfo onNavigate={onNavigate} />} />
                    <Route path="/" element={<Landing Page={LandingPage} />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/terms" element={<TermsOf documentType="terms" />} />
                    <Route path="/privacy" element={<TermsOf documentType="privacy" />} />
                    <Route path="/introduce" element={<IntroduceRedirect />} />
                    <Route path="/teacher" element={<TeacherOverview />} />
                    <Route path="/teacher/class/:classId/management" element={<TeacherHome />} />
                    <Route path="/teacher/class/:classId" element={<TeacherClass />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
