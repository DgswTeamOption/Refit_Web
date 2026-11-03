import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Overview from './pages/student/Overview/Overview';
import Class from './pages/student/Class/Class';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
        {/* 상단 글로벌 헤더 */}
        <Header
          isLoggedIn={isLoggedIn}
          userName="학생1"
          onLoginClick={() => setIsLoggedIn(true)}
          onSignupClick={() => setIsLoggedIn(true)}
          onLogoutClick={() => setIsLoggedIn(false)}
        />

        {/* 페이지 라우트 영역 */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/class/:classId" element={<Class />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* 하단 글로벌 푸터 */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
