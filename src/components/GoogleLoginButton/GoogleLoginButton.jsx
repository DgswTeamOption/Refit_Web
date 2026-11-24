import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
const runtimeKey = "__refitGoogleIdentityRuntime";
const scriptId = "google-identity-services-script";

function getRuntime() {
  if (typeof window === "undefined") return null;

  if (!window[runtimeKey]) {
    window[runtimeKey] = {
      initializedClientId: "",
      handlers: null,
      scriptPromise: null,
    };
  }

  return window[runtimeKey];
}

function loadGoogleIdentityScript(runtime) {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (runtime.scriptPromise) return runtime.scriptPromise;

  runtime.scriptPromise = new Promise((resolve, reject) => {
    let script = document.getElementById(scriptId);
    const isNewScript = !script;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
    }

    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", (error) => {
      if (isNewScript) script.remove();
      reject(error);
    }, { once: true });

    if (isNewScript) document.head.appendChild(script);
  }).catch((error) => {
    runtime.scriptPromise = null;
    throw error;
  });

  return runtime.scriptPromise;
}

function getCredentialError(credential, expectedClientId) {
  try {
    const claims = jwtDecode(credential);
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];

    if (!audiences.includes(expectedClientId)) {
      return new Error("Google 인증 Client ID가 일치하지 않습니다.");
    }
    if (!claims.exp || claims.exp * 1000 <= Date.now()) {
      return new Error("Google 인증이 만료됐습니다. 다시 시도해 주세요.");
    }
    if (!["accounts.google.com", "https://accounts.google.com"].includes(claims.iss)) {
      return new Error("유효하지 않은 Google 인증 정보입니다.");
    }
  } catch {
    return new Error("Google ID 토큰을 확인할 수 없습니다. 다시 시도해 주세요.");
  }

  return null;
}

function GoogleLoginButtonContent({ onIdToken, onError }) {
  const containerRef = useRef(null);
  const callbackRef = useRef({ onIdToken, onError });
  const ownerRef = useRef({});
  const [buttonWidth, setButtonWidth] = useState(400);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  callbackRef.current = { onIdToken, onError };

  useEffect(() => {
    const runtime = getRuntime();
    if (!runtime) return undefined;

    const owner = ownerRef.current;
    runtime.handlers = {
      owner,
      onIdToken: (token) => callbackRef.current.onIdToken?.(token),
      onError: (error) => callbackRef.current.onError?.(error),
    };

    let isMounted = true;
    loadGoogleIdentityScript(runtime)
      .then(() => {
        if (isMounted) setScriptLoaded(true);
      })
      .catch(() => {
        if (isMounted) {
          runtime.handlers?.onError(new Error("Google 로그인 서비스를 불러오지 못했습니다."));
        }
      });

    return () => {
      isMounted = false;
      if (runtime.handlers?.owner === owner) runtime.handlers = null;
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google?.accounts?.id) return;

    const runtime = getRuntime();
    if (!runtime || runtime.initializedClientId === clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        const handlers = runtime.handlers;
        const credential = credentialResponse?.credential;

        if (!credential) {
          handlers?.onError(new Error("Google에서 ID 토큰을 받지 못했습니다."));
          return;
        }

        const validationError = getCredentialError(credential, clientId);
        if (validationError) {
          handlers?.onError(validationError);
          return;
        }

        handlers?.onIdToken(credential);
      },
    });

    runtime.initializedClientId = clientId;
  }, [scriptLoaded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const resizeButton = () => {
      const availableWidth = Math.floor(container.getBoundingClientRect().width);
      if (availableWidth > 0) {
        setButtonWidth((currentWidth) => {
          const nextWidth = Math.min(400, availableWidth);
          return currentWidth === nextWidth ? currentWidth : nextWidth;
        });
      }
    };

    resizeButton();
    const observer = new ResizeObserver(resizeButton);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!scriptLoaded || !container || !window.google?.accounts?.id) return undefined;

    container.replaceChildren();
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      logo_alignment: "left",
      locale: "ko",
      width: String(buttonWidth),
    });

    return () => container.replaceChildren();
  }, [buttonWidth, scriptLoaded]);

  return <div ref={containerRef} className="google-login-wrap google-login-widget" />;
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

  return <GoogleLoginButtonContent onIdToken={onIdToken} onError={onError} />;
}
