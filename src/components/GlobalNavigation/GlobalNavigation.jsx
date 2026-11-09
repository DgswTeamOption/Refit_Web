import "./GlobalNavigation.css";

const footerPages = {
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
      onNavigate?.(page);
    };

    return (
      <div className="global-navigation-footer" onClickCapture={handleFooterClick}>
        {children}
      </div>
    );
  }

  return (
    <nav className="global-navigation-links" aria-label="서비스 메뉴">
      <a href="#service-intro">서비스 소개</a>
      <span>·</span>
      <button type="button" onClick={() => onNavigate?.("faq")}>FAQ</button>
      <span>·</span>
      <button type="button" onClick={() => onNavigate?.("terms")}>이용약관</button>
      <span>·</span>
      <button type="button" onClick={() => onNavigate?.("privacy")}>
        개인정보 처리방침
      </button>
    </nav>
  );
}
