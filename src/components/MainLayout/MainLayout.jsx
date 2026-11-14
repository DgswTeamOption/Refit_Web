import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer.jsx';
import GlobalNavigation from '../GlobalNavigation/GlobalNavigation.jsx';
import Header from '../Header/Header.jsx';
import '../../styles/global-pages.css';

const PAGE_PATHS = {
    faq: '/faq',
    terms: '/terms',
    privacy: '/privacy',
};

export default function MainLayout() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isTeacherPage = pathname.startsWith('/teacher');
    const isStudentPage = pathname === '/student' || pathname.startsWith('/class/');
    const homePath = isTeacherPage ? '/teacher' : isStudentPage ? '/student' : '/login';
    const showFooter = pathname !== '/personal-info';

    return (
        <div className="global-site">
            <Header onLogoClick={() => navigate(homePath)} />
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
