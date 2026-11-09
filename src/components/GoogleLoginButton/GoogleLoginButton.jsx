import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
function GoogleLoginButton() {
  // 기본 기본값 설정
  const defaultUser = {
    name: "로그인필요",
    email: "로그인필요",
    picture: "https://via.placeholder.com/150" // 구글 웹이미지 URL 대신 안정적인 기본 프로필 이미지 경로 사용
  };

  // 1. 초기 상태 설정: 로컬스토리지에 저장된 토큰이 있으면 디코딩, 없으면 defaultUser 사용
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        return jwtDecode(savedToken);
      } catch (error) {
        console.error("유효하지 않은 토큰입니다:", error);
        localStorage.removeItem("token");
      }
    }
    return defaultUser;
  });
  // 로그인 성공 시 실행되는 함수
  const handleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    console.log("구글 로그인 성공! 토큰:", token);

    // 로컬스토리지 저장
    localStorage.setItem("token", token);

    // 토큰 디코딩 후 React 상태 업데이트 (화면 리렌더링)
    const decoded = jwtDecode(token);
    setUser(decoded);
  };

  // 로그인 실패 시 실행되는 함수
  const handleError = () => {
    console.log("로그인 실패");
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(defaultUser);
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div>
      {!isLoggedIn ? (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          width="400"
        />
      ) : (
        <button  onClick={handleLogout}>로그아웃</button>
      )}
    </div>
  );
}

export default GoogleLoginButton;