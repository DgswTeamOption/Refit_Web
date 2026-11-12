import Button from '../../../../components/Button/Button.jsx';

export default function NoticesList({ notices, onCreate, onOpen }) {
    return (
        <section className="notices-page" aria-labelledby="notices-list-title">
            <div className="notices-list__toolbar">
                <h2 id="notices-list-title" className="notices-heading">공지 목록</h2>
                <Button text="+ 공지하기" width={168} onClick={onCreate} />
            </div>

            <div className="notices-list__cards">
                {notices.map((notice) => (
                    <article key={notice.id} className="notices-list__card">
                        <div className="notices-list__copy">
                            <p className="notices-meta">{notice.author} · {notice.date}</p>
                            <h3 id={`notice-title-${notice.id}`}>{notice.title}</h3>
                            <p className="notices-list__preview">
                                {notice.content.split('\n', 2).join(' ')}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="notices-link notices-list__open"
                            aria-describedby={`notice-title-${notice.id}`}
                            onClick={() => onOpen(notice.id)}
                        >
                            공지 보기
                        </button>
                    </article>
                ))}
                {notices.length === 0 && (
                    <p className="notices-empty">등록된 공지가 없습니다.</p>
                )}
            </div>
        </section>
    );
}
