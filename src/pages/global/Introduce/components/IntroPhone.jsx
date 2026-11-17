import { Screen } from './Screen.jsx';
import '../nfc.css';

export default function IntroPhone({ attendance = false, complete = false, eager = false, name = attendance ? 'nfc' : 'student' }) {
    const alt = name === 'calendar'
        ? '학생 홈의 8월 수업 달력과 내 수업 목록'
        : '영어1 수업의 출결 달력, NFC 출석 버튼과 공지';

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
