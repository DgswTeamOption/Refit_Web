import Nav from "../../../components/Nav/Nav";
import "./TermsOf.css";

const TERMS_SECTIONS = [
  {
    title: "목적",
    paragraphs: [
      '이 약관은 Option이 제공하는 서비스 Refit(이하 "서비스")의 이용과 관련하여 Option과 이용자 간의 권리·의무 및 책임사항을 정하는 것을 목적으로 합니다.',
    ],
  },
  {
    title: "정의",
    paragraphs: [
      '"서비스"란 Option이 제공하는 학원 보강 일정 관리 서비스(Refit)를 말합니다.',
      '"이용자"란 이 약관에 따라 서비스를 이용하는 학생 및 선생님을 말합니다.',
      '"회원"이란 서비스에 가입하여 계정을 생성한 이용자를 말합니다.',
    ],
  },
  {
    title: "약관의 효력 및 변경",
    paragraphs: [
      "이 약관은 서비스 화면 또는 연결 화면에 게시함으로써 효력이 발생합니다.",
      "Option은 필요한 경우 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 사전에 공지합니다.",
    ],
  },
  {
    title: "회원가입",
    paragraphs: [
      "이용자는 이메일 로그인으로 회원가입을 할 수 있습니다.",
      "Option은 타인의 정보를 도용하거나 허위 정보를 기재한 경우 가입을 제한하거나 취소할 수 있습니다.",
    ],
  },
  {
    title: "서비스의 제공 및 변경",
    paragraphs: [
      "Option은 수업·출결 관리, 보강 신청 및 승인, 캘린더, 알림 등의 기능을 제공합니다.",
      "서비스 내용은 운영상 필요에 따라 변경될 수 있으며, 이용자에게 중요한 변경 사항은 사전에 안내합니다.",
    ],
  },
  {
    title: "이용자의 의무",
    paragraphs: [
      "이용자는 본인의 계정 정보를 안전하게 관리하고 타인에게 공유해서는 안 됩니다.",
      "이용자는 출결·보강 관련 정보를 사실대로 입력해야 하며, 서비스를 본래 목적 외로 사용해서는 안 됩니다.",
    ],
  },
  {
    title: "Option의 의무",
    paragraphs: [
      "Option은 지속적이고 안정적인 서비스 제공을 위해 노력합니다.",
      "Option은 관련 법령에 따라 이용자의 개인정보를 안전하게 보호합니다.",
    ],
  },
  {
    title: "계약 해지 및 이용제한",
    paragraphs: [
      "이용자는 언제든지 서비스 내 기능을 통해 탈퇴(회원 탈퇴)를 요청할 수 있습니다.",
      "Option은 이용자가 이 약관을 위반한 경우 사전 통지 후 서비스 이용을 제한하거나 이용계약을 해지할 수 있습니다.",
    ],
  },
  {
    title: "책임 제한",
    paragraphs: [
      "Option은 천재지변, 통신장애 등 Option이 통제할 수 없는 사유로 발생한 서비스 장애나 손해에 대해서는 책임을 지지 않습니다.",
    ],
  },
  {
    title: "분쟁해결",
    paragraphs: [
      "이 약관과 관련하여 Option과 이용자 사이에 분쟁이 발생한 경우 상호 협의를 통해 해결합니다.",
    ],
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "수집하는 개인정보 항목 및 수집 방법",
    paragraphs: ["회사는 회원가입 및 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다."],
    lists: [
      {
        label: "필수 항목",
        items: [
          "이메일, 비밀번호, 이름, 생년월일, 역할(학생/선생님)",
          "구글 소셜로그인 이용 시: 구글 계정 정보(이메일, 이름)",
        ],
      },
      {
        label: "서비스 이용 과정에서 수집되는 항목",
        items: [
          "프로필 사진",
          "수업·출결·보강 관련 정보(참여 수업, 출석/결석 여부, 보강 신청·승인 내역)",
          "공지사항 및 메모 내용",
          "알림 수신 내역",
        ],
      },
    ],
    footer: "수집 방법: 회원가입 시, 서비스 이용 과정에서 자동 수집(접속 로그, 이용 기록)",
  },
  {
    title: "개인정보의 수집 및 이용 목적",
    items: [
      "회원 식별 및 가입 의사 확인, 회원 관리(이메일 인증, 계정 찾기 등)",
      "수업·출결·보강 일정 조율 및 관리",
      "공지사항 전달 및 알림 발송",
      "서비스 부정 이용 방지 및 문의 대응",
    ],
  },
  { title: "개인정보의 보유 및 이용 기간", paragraphs: ["회원 탈퇴 시 개인정보는 지체 없이 파기하는 것을 원칙으로 합니다."] },
  { title: "개인정보의 제3자 제공", paragraphs: ["이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다."] },
  {
    title: "개인정보 처리의 위탁",
    paragraphs: ["회사는 서비스 운영을 위해 필요한 범위에서 개인정보 처리 업무의 일부를 외부 업체(예: 서버·호스팅 업체)에 위탁할 수 있으며, 위탁 시 관련 법에 따라 필요한 사항을 규정합니다."],
  },
  {
    title: "이용자 및 법정대리인의 권리와 행사 방법",
    paragraphs: [
      "이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보의 삭제를 요청할 수 있습니다.",
      "이용자가 미성년자인 경우, 법정대리인은 아동의 개인정보에 대한 열람, 정정, 삭제를 요청할 수 있습니다.",
      "개인정보 관련 문의는 제8조의 개인정보 보호책임자에게 요청할 수 있습니다.",
    ],
  },
  {
    title: "개인정보의 파기 절차 및 방법",
    paragraphs: [
      "Option은 개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우 해당 개인정보를 파기합니다.",
      "전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제하며, 종이 문서는 분쇄하거나 소각합니다.",
    ],
  },
  {
    title: "개인정보 보호책임자",
    paragraphs: [
      "Option은 개인정보 처리에 관한 업무를 총괄하고 이용자의 불만 처리 및 피해 구제를 위해 개인정보 보호책임자를 지정하고 있습니다.",
      "담당자: 권아인",
      "문의처: teamoption8@gmail.com",
    ],
  },
  {
    title: "개인정보의 안전성 확보 조치",
    paragraphs: ["Option은 개인정보의 안전성 확보를 위해 아래와 같은 조치를 취하고 있습니다."],
    items: [
      "인증코드(이메일 인증 등)를 통한 본인 확인",
      "접근 권한의 제한(선생님/학생 역할별 접근 범위 구분)",
      "개인정보 취급자의 최소화 및 교육",
    ],
  },
  {
    title: "정책 변경에 관한 사항",
    paragraphs: ["이 개인정보처리방침은 법령·정책 또는 보안기술의 변경에 따라 내용이 추가·삭제 및 수정될 수 있으며, 변경 시 서비스 내 공지사항을 통해 사전 고지합니다."],
  },
];

export default function TermsOf({ documentType = "terms" }) {
  const isPrivacy = documentType === "privacy";
  const title = isPrivacy ? "개인정보 처리방침" : "이용약관";
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
      <main className="terms-page">
        <Nav items={[{ text: "홈", link: "/" }, { text: title }]} />
        <div className="global-page-heading"><h1>{title}</h1></div>

        <p className="terms-effective-date">시행일 2026. 08. 01</p>
        {isPrivacy && (
          <p className="terms-intro">
            Option은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
            회사는 개인정보처리방침을 통해 이용자가 제공하는 개인정보가 어떤 목적과 방식으로 이용되며,
            개인정보 보호를 위해 어떤 조치가 취해지고 있는지 알려드립니다.
          </p>
        )}
        <article className="terms-copy">
          {sections.map((section, index) => (
            <section className="terms-copy-section" key={section.title}>
              <h2>제{index + 1}조 {section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.lists?.map((list) => (
                <div className="terms-copy-list-group" key={list.label}>
                  <p>{list.label}</p>
                  <ul>{list.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              ))}
              {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
              {section.footer && <p>{section.footer}</p>}
            </section>
          ))}
        </article>
      </main>
  );
}
