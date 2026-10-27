import { useId } from 'react';
import './ClassBlock.css';

/**
 * 이미지 기준 수업 카드. API 호출과 나가기 확인은 부모에서 처리합니다.
 * 아래 props 계약은 이슈에 명시되지 않아 제안한 설계입니다.
 *
 * @param {Object} props
 * @param {string} props.title 수업명 (필수)
 * @param {() => void | Promise<void>} props.onLeave 나가기 요청 핸들러 (필수)
 * @param {boolean} [props.isLeaving=false] 부모에서 관리하는 요청 진행 상태
 * @param {boolean} [props.disabled=false] 나가기 버튼 비활성화 여부
 * @param {string} [props.className=''] 레이아웃 확장용 클래스
 */
function ClassBlock({
                        title,
                        onLeave,
                        isLeaving = false,
                        disabled = false,
                        className = '',
                    }) {
    const titleId = useId();

    return (
        <article
            className={`class-block ${className}`.trim()}
            aria-labelledby={titleId}
        >
            <div className="class-block__banner" aria-hidden="true" />

            <div className="class-block__body">
                <h3 id={titleId} className="class-block__title">
                    {title}
                </h3>

                <button
                    type="button"
                    className="class-block__leave"
                    onClick={() => onLeave()}
                    disabled={disabled || isLeaving}
                    aria-label={`${title} 수업 나가기`}
                    aria-busy={isLeaving}
                >
                    {isLeaving ? '나가는 중…' : '수업 나가기'}
                </button>
            </div>
        </article>
    );
}

export default ClassBlock;
