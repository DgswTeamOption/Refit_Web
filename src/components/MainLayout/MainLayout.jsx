import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer.jsx';
import GlobalNavigation from '../GlobalNavigation/GlobalNavigation.jsx';
import Header from '../Header/Header.jsx';
import { isAuthenticatedSession, normalizeRole } from '../../utils/auth.js';
import '../../styles/global-pages.css';

const PAGE_PATHS = {
    introduce: '/introduce',
    faq: '/faq',
    terms: '/terms',
    privacy: '/privacy',
};

export default function MainLayout() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticatedSession();
    const isTeacherPage = pathname.startsWith('/teacher');
    const isStudentPage = pathname === '/student' || pathname.startsWith('/class/');
    const savedRole = typeof window !== 'undefined'
        ? normalizeRole(localStorage.getItem('role'))
        : '';
    const activeRole = savedRole || (isTeacherPage ? 'teacher' : isStudentPage ? 'student' : '');
    const homePath = activeRole === 'teacher'
        ? '/teacher'
        : activeRole === 'student'
            ? '/student'
            : '/login';
    const showFooter = !isLoggedIn && !isTeacherPage && !isStudentPage && pathname !== '/personal-info';

    return (
        <div className="global-site">
            <Header showServiceMenu onLogoClick={() => navigate(homePath)} />
            <Outlet />
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
