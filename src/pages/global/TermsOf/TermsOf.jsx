import GlobalPageLayout from "../../../components/GlobalPageLayout/GlobalPageLayout";
import Nav from "../../../components/Nav/Nav";
import "./TermsOf.css";

const policyText = "서비스 이용에 필요한 내용을 안내합니다. 본 화면은 원문 정책 내용을 확인할 수 있는 페이지입니다.";

const sections = [
  "목적",
  "서비스 이용",
  "개인정보의 수집 및 이용",
  "정보 보관 및 보호",
  "이용자의 권리",
];

export default function TermsOf({ documentType = "terms", onNavigate }) {
  const isPrivacy = documentType === "privacy";
  const title = isPrivacy ? "개인정보 처리방침" : "이용약관";

  return (
    <GlobalPageLayout onNavigate={onNavigate}>
      <main className="terms-page">
        <Nav items={[{ text: "홈", link: "/" }, { text: title }]} />
        <div className="global-page-heading"><h1>{title}</h1></div>

        <p className="terms-effective-date">시행일 2026. 08. 01</p>
        <article className="terms-copy">
          {sections.map((section, index) => (
            <section className="terms-copy-section" key={section}>
              <h2>제{index + 1}조 {section}</h2>
              <p>{policyText}</p>
            </section>
          ))}
        </article>
      </main>
    </GlobalPageLayout>
  );
}
