import "./AuthLayout.css";

export default function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-panel">
          <div className="auth-panel-content">
            <img src="/logo.svg" alt="Refit" width="103" height="49" className="auth-logo" />
            {children}
          </div>
        </div>

        <aside className="auth-visual" aria-label="리핏 서비스 소개">
          <picture>
            <source media="(min-width: 961px) and (min-height: 651px)"
              srcSet="/login-visual-800.webp 800w, /login-visual-1600.webp 1600w"
              sizes="(max-aspect-ratio: 17/10) 44vw, 75vh" />
            <img src="/login-visual-800.webp" alt="" width="800" height="921"
              loading="lazy" decoding="async" className="auth-visual-image" />
          </picture>
          <div className="auth-visual-copy">
            <h2>복잡한 수업관리<br />리핏으로 해결하세요</h2>
            <p>출결 확인, 보강 신청, 학생 관리를<br />한곳에서</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
