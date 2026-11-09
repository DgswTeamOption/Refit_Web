import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
function GoogleLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));
  const startGoogleLogin = useGoogleLogin({
    onSuccess: ({ access_token: token }) => {
      localStorage.setItem("token", token);
      setIsLoggedIn(true);
    },
    onError: () => console.error("구글 로그인에 실패했습니다."),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="google-login-wrap">
      {!isLoggedIn ? (
        <button type="button" className="google-login-button" onClick={() => startGoogleLogin()}>
          <svg className="google-login-icon" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.6-4.3 6l6.8 5.3c4-3.7 6.1-9 6.1-15z" />
            <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.8-5.3c-1.9 1.3-4.1 2-6.7 2-5.1 0-9.4-3.4-10.9-8H6.1v5.5C9.5 39.7 16.2 44 24 44z" />
            <path fill="#FBBC05" d="M13.1 27.8a12 12 0 0 1 0-7.6v-5.5H6.1a20 20 0 0 0 0 18.6l7-5.5z" />
            <path fill="#EA4335" d="M24 12.2c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4 16.2 4 9.5 8.3 6.1 14.7l7 5.5c1.5-4.6 5.8-8 10.9-8z" />
          </svg>
          <span>Google 계정으로 로그인</span>
        </button>
      ) : (
        <button  onClick={handleLogout}>로그아웃</button>
      )}
    </div>
  );
}

export default GoogleLoginButton;
