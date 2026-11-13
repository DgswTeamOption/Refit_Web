import GlobalPageLayout from "../../../components/GlobalPageLayout/GlobalPageLayout";
import Nav from "../../../components/Nav/Nav";
import "./Introduce.css";

const featureItems = [
  {
    title: "간편한 수업 및 일정 관리",
    description: "달력 기반으로 이번 달 수업 일정과 출결 현황을 한눈에 파악하고 관리할 수 있습니다.",
  },
  {
    title: "빠른 결석·보강 신청",
    description: "학생은 원하는 날짜와 시간을 선택해 결석 및 보강을 신청하고, 선생님은 실시간으로 승인·관리합니다.",
  },
  {
    title: "수업 공지 및 알림 연동",
    description: "수업별 공지사항과 보강 승인 여부를 즉시 확인하여 빈틈없는 학습 일정을 유지합니다.",
  },
];

export default function Introduce({ onNavigate }) {
  return (
    <GlobalPageLayout onNavigate={onNavigate}>
      <main className="introduce-page">
        <Nav items={[{ text: "홈", link: "/" }, { text: "서비스 소개" }]} />
        <div className="global-page-heading">
          <h1>서비스 소개</h1>
        </div>

        <section className="introduce-hero">
          <h2>빈틈을 채우는 스마트한 보강 관리, Refit</h2>
          <p>
            Refit은 학원과 학교 수업에서 발생하는 결석 및 보강 일정을 학생과 선생님이
            가장 직관적으로 조율할 수 있도록 돕는 교육 일정 관리 서비스입니다.
          </p>
        </section>

        <section className="introduce-features" aria-label="주요 기능">
          {featureItems.map((item) => (
            <div key={item.title} className="introduce-feature-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </GlobalPageLayout>
  );
}
