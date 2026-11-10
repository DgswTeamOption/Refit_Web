// 수업 상세 페이지 관련 상수 및 목업 데이터

export const CLASS_TABS = [
    { key: 'main', label: '메인' },
    { key: 'absence', label: '결석 일정' },
    { key: 'makeup', label: '보강 일정' },
];

export const CLASS_TITLES = {
    eng1: '영어1',
    eng2: '영어2',
    math1: '수학1',
    math2: '수학2',
};

export const NOTICES_DATA = [
    {
        id: 'notice-1',
        author: '선생님',
        date: '2026. 08. 20',
        title: '(역량 수행평가안내) 자기성장보고서 & 북 프리젠테이션',
        excerpt: '재학생을 대상으로 특강을 할 학생 전문가를 모집합니다. 신청 링크에서 신청서를 작성해주세요.',
        content: [
            '재학생을 대상으로 특강을 할 학생 전문가를 모집합니다.',
            '특강을 희망하는 학생은 아래 신청 링크에서 신청서를 작성하면 됩니다.',
            '1. 대상: 재학생 전체',
            '2. 모집 기간: ~ 2026. 9. 11 (금)까지',
            '3. 특강 가능 일시: 설문 참고',
            '4. 특강 시간: 40분 ~ 50분',
            '5. 참여 학생 지원 사항: 필요한 자료 및 도서를 구입할 수 있는 문화상품권 25,000원 증정',
            '신청 링크: https://refit.example/apply',
        ],
    },
    {
        id: 'notice-2',
        author: '선생님',
        date: '2026. 08. 18',
        title: '2학기 수업 일정 안내',
        excerpt: '이번 달 수업 및 보강 일정을 안내합니다.',
        content: [
            '이번 달 수업 및 보강 일정을 안내합니다.',
            '개인 사정으로 인한 결석 시 최소 24시간 전 결석 일정을 등록해 주시기 바랍니다.',
            '보강은 협의 후 일정에 따라 순차 배정됩니다.',
        ],
    },
    {
        id: 'notice-3',
        author: '선생님',
        date: '2026. 08. 15',
        title: '교재 준비 안내',
        excerpt: '다음 수업 전까지 교재를 준비해주세요.',
        content: [
            '다음 수업 전까지 지정 교재(Refit 기본 워크북 2권)를 준비해주세요.',
            '교재 분실 시 담당 교사에게 문의 바랍니다.',
        ],
    },
];

export const INITIAL_ABSENCE_LIST = [
    { id: 1, date: '2026년 8월 27일', reason: '병원 방문', status: '대기중', canCancel: true },
    { id: 2, date: '2026년 8월 20일', reason: '가족 일정', status: '수락됨', canCancel: false },
    { id: 3, date: '2026년 8월 18일', reason: '개인 일정', status: '거절됨', canCancel: false },
];

export const INITIAL_MAKEUP_LIST = [
    { id: 1, date: '2026년 8월 29일', time: '16:00 ~ 17:00', reason: '병원 방문', status: '대기중', canCancel: true },
    { id: 2, date: '2026년 8월 22일', time: '17:00 ~ 18:00', reason: '가족 일정', status: '수락됨', canCancel: false },
    { id: 3, date: '2026년 8월 15일', time: '15:00 ~ 16:00', reason: '개인 일정', status: '거절됨', canCancel: false },
];

// YYYY-MM-DD -> YYYY년 M월 D일 포맷팅 (년도 포함)
export const formatToKoreanDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
        }
    }
    return dateStr;
};
