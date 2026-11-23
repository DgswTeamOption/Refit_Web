import { lazy, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer.jsx';
import GlobalNavigation from '../GlobalNavigation/GlobalNavigation.jsx';
import Header from '../Header/Header.jsx';
import { isAuthenticatedSession, normalizeRole } from '../../utils/auth.js';
import '../../styles/global-pages.css';

const TeacherChatbot = lazy(() => import('../TeacherChatbot/TeacherChatbot.jsx'));

const PAGE_PATHS = {
    introduce: '/introduce',
    faq: '/faq',
    terms: '/terms',
    privacy: '/privacy',
};

export default function MainLayout() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isTeacherPage = pathname.startsWith('/teacher');
    const isStudentPage = pathname === '/student' || pathname.startsWith('/class/');
    const savedRole = typeof window !== 'undefined'
        ? normalizeRole(localStorage.getItem('role'))
        : '';
    const activeRole = savedRole || (isTeacherPage ? 'teacher' : isStudentPage ? 'student' : '');
    const showTeacherChatbot = isTeacherPage
        && savedRole === 'teacher'
        && isAuthenticatedSession();
    const classId = pathname.match(/^\/teacher\/class\/(\d+)/)?.[1] ?? '';
    const homePath = activeRole === 'teacher'
        ? '/teacher'
        : activeRole === 'student'
            ? '/student'
            : '/login';
    const showFooter = pathname !== '/personal-info';

    return (
        <div className="global-site">
            <Header showServiceMenu onLogoClick={() => navigate(homePath)} />
            <Outlet />
            {showTeacherChatbot && (
                <Suspense fallback={null}>
                    <TeacherChatbot initialClassId={classId} />
                </Suspense>
            )}
            {showFooter && (
                <GlobalNavigation
                    variant="footer"
                    onNavigate={(page) => navigate(PAGE_PATHS[page] ?? '/login')}
                >
                    <Footer />
                </GlobalNavigation>
            )}
        </div>
    );
}
