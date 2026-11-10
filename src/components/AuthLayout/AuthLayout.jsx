export default function AuthLayout({ className = "", children }) {
  return (
    <div className={`LoginPage ${className}`.trim()}>
      <div className="LoginWrap">
        <img src="/logo.svg" alt="로고" className="logoImg" />
        {children}
      </div>
      <img src="/Refit.github.webp" alt="" className="LoginImg" />
    </div>
  );
}
