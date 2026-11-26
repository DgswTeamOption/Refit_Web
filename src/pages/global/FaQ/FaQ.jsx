import { useMemo, useState } from "react";
import Nav from "../../../components/Nav/Nav";
import "./FaQ.css";

import { questions } from "./questions.js";

export default function FaQ() {
  const [query, setQuery] = useState("");

  const visibleQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? questions.filter(({ question, answer }) =>
          `${question} ${answer}`.toLowerCase().includes(normalizedQuery),
        )
      : questions;
  }, [query]);

  return (
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
            {visibleQuestions.map(({ question, answer }) => (
              <details className="faq-question-row" key={question}>
                <summary>
                  <span>{question}</span>
                  <span className="faq-question-chevron" aria-hidden="true" />
                </summary>
                <div className="faq-answer-clip">
                  <p className="faq-answer">{answer}</p>
                </div>
              </details>
            ))}
            {visibleQuestions.length === 0 && <p className="faq-no-results">검색 결과가 없습니다.</p>}
          </div>
        </section>
      </main>
  );
}
