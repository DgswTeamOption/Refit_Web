import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import GlobalNavigation from '../GlobalNavigation/GlobalNavigation';

/**
 * 학생 화면 전용 레이아웃 (로그인 전용 헤더 + 컨텐츠 + 푸터)
 */
export default function StudentLayout() {
  const navigate = useNavigate();
  const userName = (typeof window !== 'undefined' && localStorage.getItem('userName')) || '학생1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <Header
        isLoggedIn={true}
        userName={userName}
        onLogoClick={() => navigate('/student')}
        onLogoutClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }}
      />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <GlobalNavigation variant="footer" onNavigate={(page) => navigate(`/${page}`)}>
        <Footer />
      </GlobalNavigation>
    </div>
  );
}
