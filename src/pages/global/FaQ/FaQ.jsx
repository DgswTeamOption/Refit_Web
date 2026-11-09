import { useMemo, useState } from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import GlobalNavigation from "../../../components/GlobalNavigation/GlobalNavigation";
import Nav from "../../../components/Nav/Nav";
import "./FaQ.css";

const questions = [
  "수업 코드는 어디서 확인하나요?",
  "결석 신청을 취소할 수 있나요?",
  "보강 신청은 어떻게 하나요?",
  "계정 정보를 수정하려면?",
];

export default function FaQ({ onNavigate }) {
  const [query, setQuery] = useState("");

  const visibleQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? questions.filter((question) => question.toLowerCase().includes(normalizedQuery))
      : questions;
  }, [query]);

  return (
    <div className="faq-site">
      <div className="faq-site-header global-page-header with-account-links">
        <Header />
        <GlobalNavigation variant="account" onNavigate={onNavigate} />
      </div>
      <main className="faq-page">
        <Nav items={[{ text: "홈", link: "/" }, { text: "FAQ" }]} />
        <div className="global-page-heading"><h1>FAQ</h1></div>

      <label className="faq-search">
        <span className="faq-screen-reader">자주 묻는 질문 검색</span>
        <input
          type="search"
          placeholder="무엇을 도와드릴까요?"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

        <section className="faq-questions" aria-labelledby="faq-questions-heading">
          <h2 id="faq-questions-heading">자주 묻는 질문</h2>
          <div className="faq-question-list">
            {visibleQuestions.map((question) => (
              <div className="faq-question-row" key={question}>
                <span>{question}</span>
                <span aria-hidden="true">⌄</span>
              </div>
            ))}
            {visibleQuestions.length === 0 && <p className="faq-no-results">검색 결과가 없습니다.</p>}
          </div>
        </section>
      </main>
      <GlobalNavigation variant="footer" onNavigate={onNavigate}>
        <Footer />
      </GlobalNavigation>
    </div>
  );
}
