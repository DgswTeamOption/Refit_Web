import { useMemo, useState } from "react";
import GlobalPageLayout from "../../../components/GlobalPageLayout/GlobalPageLayout";
import Nav from "../../../components/Nav/Nav";
import "./FaQ.css";

const questions = [
  {
    question: "리핏은 누가 쓸 수 있나요?",
    answer: "학원 선생님과 학생 모두 사용할 수 있어요. 가입 시 역할(학생/선생님)을 선택하면 그에 맞는 화면이 제공돼요.",
  },
  {
    question: "수업 참여는 어떻게 하나요?",
    answer: "선생님이 만든 수업의 고유 코드를 입력하면 바로 참여할 수 있어요.",
  },
  {
    question: "보강 신청은 어떻게 하나요?",
    answer: "결석 사유를 작성하고 희망 보강 날짜를 선택하면 선생님에게 전달돼요. 승인되면 알림으로 바로 알려드려요.",
  },
  {
    question: "신청한 보강을 취소할 수 있나요?",
    answer: "네, 신청 목록에서 승인 전까지 취소할 수 있어요.",
  },
  {
    question: "출석 / 보강 기록은 어디서 확인하나요?",
    answer: "학생은 수업 현황에서, 선생님은 학생별 통계에서 남은 수업 · 보강 일수를 확인할 수 있어요.",
  },
];

export default function FaQ({ onNavigate }) {
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
    <GlobalPageLayout onNavigate={onNavigate}>
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
                  <span className="faq-question-chevron" aria-hidden="true">⌄</span>
                </summary>
                <p className="faq-answer">{answer}</p>
              </details>
            ))}
            {visibleQuestions.length === 0 && <p className="faq-no-results">검색 결과가 없습니다.</p>}
          </div>
        </section>
      </main>
    </GlobalPageLayout>
  );
}
