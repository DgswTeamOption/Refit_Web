import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

function GoogleLoginButtonContent({ onIdToken, onError }) {
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(400);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const resizeButton = () => {
      const availableWidth = Math.floor(container.getBoundingClientRect().width);
      if (availableWidth > 0) setButtonWidth(Math.min(400, availableWidth));
    };

    resizeButton();
    const observer = new ResizeObserver(resizeButton);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="google-login-wrap google-login-widget">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (!credentialResponse.credential) {
            onError?.(new Error("Google에서 ID 토큰을 받지 못했습니다."));
            return;
          }

          try {
            const claims = jwtDecode(credentialResponse.credential);
            const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
            if (!audiences.includes(clientId)) {
              onError?.(new Error("Google 인증 Client ID가 일치하지 않습니다."));
              return;
            }
            if (!claims.exp || claims.exp * 1000 <= Date.now()) {
              onError?.(new Error("Google 인증이 만료됐습니다. 다시 시도해 주세요."));
              return;
            }
            if (!["accounts.google.com", "https://accounts.google.com"].includes(claims.iss)) {
              onError?.(new Error("유효하지 않은 Google 인증 정보입니다."));
              return;
            }
          } catch {
            onError?.(new Error("Google ID 토큰을 확인할 수 없습니다. 다시 시도해 주세요."));
            return;
          }

          onIdToken?.(credentialResponse.credential);
        }}
        onError={() => onError?.(new Error("Google 인증에 실패했습니다. 다시 시도해 주세요."))}
        theme="outline"
        size="large"
        shape="rectangular"
        text="continue_with"
        logo_alignment="left"
        locale="ko"
        width={String(buttonWidth)}
      />
    </div>
  );
}

export default function GoogleLoginButton({ onIdToken, onError }) {
  if (!clientId) {
    return (
      <div className="google-login-wrap">
        <button
          type="button"
          className="google-login-button"
          onClick={() => onError?.(new Error("VITE_GOOGLE_CLIENT_ID 설정이 필요합니다."))}
        >
          Google로 계속하기
        </button>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLoginButtonContent onIdToken={onIdToken} onError={onError} />
    </GoogleOAuthProvider>
  );
}
