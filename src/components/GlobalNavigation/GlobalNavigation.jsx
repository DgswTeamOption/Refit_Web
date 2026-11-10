import "./GlobalNavigation.css";

const footerPages = {
  "#service-intro": "introduce",
  "#faq": "faq",
  "#terms": "terms",
  "#privacy": "privacy",
};

export default function GlobalNavigation({
  variant = "public",
  onNavigate,
  children,
}) {
  if (variant === "footer") {
    const handleFooterClick = (event) => {
      const link = event.target.closest("a.footer-link");
      const page = link && footerPages[link.getAttribute("href")];

      if (!page) return;

      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      onNavigate?.(page);
    };

    return (
      <div className="global-navigation-footer" onClickCapture={handleFooterClick}>
        {children}
      </div>
    );
  }

  const handleNavClick = (page) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    onNavigate?.(page);
  };

  return (
    <nav className="global-navigation-links" aria-label="서비스 메뉴">
      <button type="button" onClick={() => handleNavClick("introduce")}>서비스 소개</button>
      <span>·</span>
      <button type="button" onClick={() => handleNavClick("faq")}>FAQ</button>
      <span>·</span>
      <button type="button" onClick={() => handleNavClick("terms")}>이용약관</button>
      <span>·</span>
      <button type="button" onClick={() => handleNavClick("privacy")}>
        개인정보 처리방침
      </button>
    </nav>
  );
}
