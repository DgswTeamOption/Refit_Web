# Refit 출시 설정

## 빌드 및 EC2

1. Node.js 20.19 이상인 20.x 또는 22.12 이상 환경에서 `npm ci`, `npm run lint`, `npm run build`를 실행합니다. `dist`에는 소개와 FAQ의 사전 렌더링 HTML, 페이지별 메타데이터, 비공개 경로용 `app.html`이 생성됩니다.
2. EC2의 refit.team Nginx 서버 블록에서 기존 프런트엔드 경로 규칙을 [refit-routes.nginx.conf](refit-routes.nginx.conf)에 맞춥니다. 기존 `root`, TLS, `/api/` 및 `/uploads/` 프록시를 유지합니다. gzip 지시어가 같은 서버 블록에 있으면 한 곳에만 둡니다.
3. 새 빌드가 EC2에 올라간 뒤 운영 담당자가 `sudo nginx -t`를 실행하고 성공하면 `sudo systemctl reload nginx`를 실행합니다. 배포 워크플로는 빌드 파일을 복사하므로 Nginx 경로 설정은 운영 담당자가 반영해야 합니다.
4. `/`, `/faq`, `/login`, `/signup`, `/robots.txt`, `/sitemap.xml`이 HTTP 200을 반환하는지 확인합니다. `/introduce`는 301로 `/`로 이동하고 존재하지 않는 경로는 404를 반환해야 합니다. 응답 원문에서 `/`와 `/faq`의 본문과 canonical, 인증 화면의 `noindex`를 확인합니다.
5. 실제 운영 계정으로 로그인, 회원가입, Google 로그인과 회원가입, 학생·선생님 화면을 확인합니다. 이어서 운영 주소의 Lighthouse를 측정해 CDN, 압축, Google 위젯 영향까지 확인합니다.

Nginx의 1년 캐시는 파일명에 해시가 붙은 `/assets/`에만 적용합니다. HTML과 고정 이름의 공개 파일은 재검증 가능한 기존 캐시 정책을 유지합니다. robots.txt는 검색 정책이며 계정 및 수업 데이터 접근 권한은 기존 인증 API에서 계속 관리합니다.

## 검색 서비스 등록

- [Google Search Console](https://search.google.com/search-console)에서 도메인 속성 `refit.team`을 추가합니다. 발급된 TXT 레코드를 DNS에 추가하고 소유권을 확인합니다. Sitemaps에 `https://refit.team/sitemap.xml`을 제출한 뒤 URL 검사로 루트와 FAQ를 점검합니다. [소유권 확인 가이드](https://support.google.com/webmasters/answer/9008080)
- [Naver Search Advisor](https://searchadvisor.naver.com/)의 웹마스터 도구에서 `https://refit.team`을 추가합니다. 발급된 HTML 파일을 `public/`에 넣어 배포하거나 제공된 메타 태그를 `index.html`에 추가해 다시 빌드합니다. 소유 확인 후 요청 메뉴의 사이트맵 제출에서 절대 URL을 입력합니다. [사이트 등록 가이드](https://searchadvisor.naver.com/guide/started-register)
- [Bing Webmaster Tools](https://www.bing.com/webmasters/)에서 확인된 Search Console 속성을 가져오거나 `https://refit.team`을 추가합니다. 직접 추가한 경우 계정에 표시되는 인증 방법으로 확인 후 Sitemaps에 같은 사이트맵을 제출합니다. [사이트 등록 및 인증 가이드](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b)

## 검색 및 AI 크롤러

소개와 FAQ는 HTML, 실제 UI와 같은 FAQ 데이터, 한국어 제목·설명, 공식 도메인, 구조화된 데이터로 서비스 정보를 제공합니다. Googlebot, Bingbot, Yeti, OAI-SearchBot 및 PerplexityBot은 공개 페이지를 수집할 수 있습니다. GPTBot은 학습 목적 정책으로 차단합니다. Google-Extended는 Gemini의 검색 근거 활용까지 제한하는 정책이므로 현재 허용 상태로 둡니다. Google Search의 AI 기능에서는 별도 AI 텍스트 파일이 요구되지 않아 일반 HTML, 사이트맵, 구조화된 데이터로 구성했습니다.

- [Google Search AI 기능 안내](https://developers.google.com/search/docs/appearance/ai-features)
- [Google 생성형 AI 데이터 사용 제어](https://developers.google.com/crawling/docs/google-extended)
- [OpenAI 크롤러 정책](https://developers.openai.com/api/docs/bots)
- [Perplexity 크롤러 정책](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

## 폰트

Pretendard 1.3.9의 공식 가변 서브셋과 라이선스를 `public/fonts/pretendard`에 보관합니다. `refit-ui.woff2`는 화면에 표시되는 정적 문구를 모아 같은 원본에서 추출한 가변 폰트입니다. 새 글자가 추가되면 공식 서브셋이 자동으로 사용되므로 기능에 영향 없이 첫 화면 글꼴을 갱신할 수 있습니다.
