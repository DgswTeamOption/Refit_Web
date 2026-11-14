import "./AuthLayout.css";

export default function AuthLayout({ children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-panel">
          <div className="auth-panel-content">
            <img src="/logo.svg" alt="Refit" className="auth-logo" />
            {children}
          </div>
        </div>

        <aside className="auth-visual" aria-label="리핏 서비스 소개">
          <img src="/LoginImg.png" alt="" className="auth-visual-image" />
          <div className="auth-visual-copy">
            <h2>복잡한 수업관리<br />리핏으로 해결하세요</h2>
            <p>출결 확인, 보강 신청, 학생 관리를<br />한곳에서</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
