import { questions } from '../pages/global/FaQ/questions.js';

const origin = 'https://refit.team';
const brand = '리핏 (Refit)';

export function pageMetadata(path) {
    const pathname = path.replace(/\/+$/, '') || '/';
    const pages = {
        '/': ['리핏 (Refit) | 학원 출결·보강 관리와 NFC 출석',
            '리핏은 학원 선생님과 학생이 수업 일정, 결석과 보강 신청, NFC 출석을 한곳에서 관리하는 서비스입니다.'],
        '/faq': ['자주 묻는 질문 | 리핏 (Refit)',
            '리핏의 수업 참여, 보강 신청과 취소, 출석 및 보강 기록 확인 방법을 알아보세요.'],
        '/login': ['로그인 | 리핏 (Refit)', '리핏에 로그인해 수업 일정과 출결을 확인하세요.'],
        '/signup': ['회원가입 | 리핏 (Refit)', '학생 또는 선생님으로 리핏에 가입하세요.'],
        '/terms': ['이용약관 | 리핏 (Refit)', '리핏 서비스 이용약관입니다.'],
        '/privacy': ['개인정보 처리방침 | 리핏 (Refit)', '리핏 개인정보 처리방침입니다.'],
    };
    const canonicalPath = pathname === '/introduce' ? '/' : pathname;
    const [title, description] = Object.hasOwn(pages, canonicalPath)
        ? pages[canonicalPath] : ['리핏 (Refit)', '리핏 학원 수업 관리 서비스'];
    const indexable = pathname === '/' || pathname === '/faq';
    const canonical = indexable || pathname === '/introduce' ? origin + canonicalPath : null;
    const tags = [
        ['name', 'description', description],
        ['name', 'robots', indexable ? 'index, follow' : 'noindex, follow'],
    ];
    if (indexable) {
        tags.push(
            ['property', 'og:type', 'website'],
            ['property', 'og:site_name', brand],
            ['property', 'og:locale', 'ko_KR'],
            ['property', 'og:title', title],
            ['property', 'og:description', description],
            ['property', 'og:url', canonical],
            ['property', 'og:image', origin + '/refit-share.jpg'],
            ['property', 'og:image:alt', '리핏 로고'],
            ['name', 'twitter:card', 'summary_large_image'],
        );
    }
    const schema = pathname === '/' ? {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${origin}/#website`,
                name: brand,
                alternateName: 'Refit',
                url: canonical,
            },
            {
                '@type': 'WebApplication',
                name: '리핏',
                alternateName: 'Refit',
                url: canonical,
                description,
                applicationCategory: 'EducationalApplication',
                operatingSystem: 'Web',
                inLanguage: 'ko-KR',
                audience: { '@type': 'Audience', audienceType: '학원 선생님과 학생' },
                featureList: ['수업 일정 관리', '결석 및 보강 관리', 'NFC 출석'],
            },
        ],
    } : pathname === '/faq' ? {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        name: '리핏 자주 묻는 질문', description, url: canonical, inLanguage: 'ko-KR',
        mainEntity: questions.map(({ question, answer }) => ({
            '@type': 'Question', name: question,
            acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
    } : null;
    return { title, tags, canonical, schema };
}
