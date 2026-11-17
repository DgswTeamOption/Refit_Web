import { Screen } from './Screen.jsx';
import '../nfc.css';

const screenAlt = {
    calendar: '학생 홈의 2026년 8월 수업 달력',
    student: '학생 홈의 알림, 수업 달력과 내 수업 목록',
    nfc: '영어1 수업의 출결 달력, NFC 출석 버튼과 공지',
};

export default function IntroPhone({ attendance = false, complete = false, eager = false, name = attendance ? 'nfc' : 'student' }) {
    const alt = screenAlt[name] ?? '리핏 모바일 화면';

    return (
        <div className="ri-handset">
            <div className="ri-handset__display">
                <Screen name={name} eager={eager} alt={alt} />
                {attendance && (
                    <span data-nfc-action="" className="ri-handset__action" role="status">
                        {complete ? '✓ 출석 완료' : 'NFC 태그하기'}
                    </span>
                )}
            </div>
        </div>
    );
}
