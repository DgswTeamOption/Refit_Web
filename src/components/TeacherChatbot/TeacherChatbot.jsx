import { useEffect, useRef, useState } from 'react';
import { listChatbotClasses, queryChatbot } from '../../api/chatbot.js';
import './TeacherChatbot.css';

const QUICK_QUESTIONS = [
    '이번 달 현황 알려줘',
    '보강 미제안 학생 알려줘',
    '보강 시간 추천해줘',
];

function isNumericValue(value) {
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function makeMessageId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeClasses(value) {
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
        const id = item?.classId ?? item?.class_id ?? item?.id;
        if (!/^[1-9]\d*$/.test(String(id ?? ''))) return [];

        return [{
            id: String(id),
            name: item?.name ?? item?.className ?? item?.title ?? `수업 ${id}`,
        }];
    });
}

function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function ResultDetails({ result }) {
    if (!result?.type || result.data == null) return null;

    if (result.type === 'MONTHLY_STATUS') {
        const status = result.data;
        const values = [
            ['결석', status.absenceCount],
            ['보강', status.makeupCount],
            ['보강 대기', status.pendingMakeupCount],
        ].filter(([, value]) => isNumericValue(value));

        if (!values.length) return null;

        return (
            <dl className="teacher-chatbot__stats" aria-label="이번 달 현황">
                {values.map(([label, value]) => (
                    <div className="teacher-chatbot__stat" key={label}>
                        <dt>{label}</dt>
                        <dd>{Number(value)}건</dd>
                    </div>
                ))}
            </dl>
        );
    }

    if (!['STUDENT', 'RECOMMEND_TIME', 'UNPROPOSED_STUDENTS'].includes(result.type)) {
        return null;
    }

    const rows = Array.isArray(result.data) ? result.data : [];
    if (!rows.length) return null;

    return (
        <div className="teacher-chatbot__result-list">
            {rows.map((row, index) => {
                const isRecommendation = result.type === 'RECOMMEND_TIME';
                const title = isRecommendation
                    ? row.dayOfWeek || formatDateTime(row.makeupTime) || `추천 ${index + 1}`
                    : row.name || '학생 정보';
                const subtitle = isRecommendation
                    ? formatDateTime(row.makeupTime)
                    : row.className;
                const details = isRecommendation
                    ? [['신청 인원', row.applicantCount, '명']]
                    : [
                        ['결석', row.absenceCount, '회'],
                        ...(result.type === 'STUDENT' ? [['보강', row.makeupCount, '회']] : []),
                    ];

                return (
                    <article className="teacher-chatbot__result-card" key={`${row.studentId ?? row.rank ?? title}-${index}`}>
                        <div className="teacher-chatbot__result-heading">
                            <strong>{isRecommendation ? `${row.rank || index + 1}순위 · ${title}` : title}</strong>
                            {subtitle && <span>{subtitle}</span>}
                        </div>
                        {details.some(([, value]) => isNumericValue(value)) && (
                            <div className="teacher-chatbot__result-meta">
                                {details.filter(([, value]) => isNumericValue(value)).map(([label, value, unit]) => (
                                    <span key={label}>{label} <b>{Number(value)}{unit}</b></span>
                                ))}
                                {!isRecommendation && row.lastAbsenceDate && (
                                    <span>최근 결석 <b>{row.lastAbsenceDate}</b></span>
                                )}
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}

function ChatMessage({ message }) {
    const isAssistant = message.role === 'assistant';

    return (
        <article className={`teacher-chatbot__message teacher-chatbot__message--${message.role}${message.isError ? ' is-error' : ''}`}>
            {isAssistant && <span className="teacher-chatbot__message-label">Refit AI</span>}
            <div className="teacher-chatbot__bubble">
                <p>{message.text}</p>
                {isAssistant && <ResultDetails result={message.result} />}
            </div>
        </article>
    );
}

function ChatbotIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 11.4a7.7 7.7 0 0 1-8 7.4 8.5 8.5 0 0 1-3.4-.7L4 19l1.1-3.5a7 7 0 0 1-1.1-3.8 7.7 7.7 0 0 1 8-7.4 7.7 7.7 0 0 1 8 7.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8.2 11.8h.1m3.6 0h.1m3.6 0h.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

function SendIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m4 5 16 7-16 7 2.7-7L4 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M7 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

export default function TeacherChatbot({ initialClassId = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            text: '안녕하세요, 선생님. 출결과 보강 정보를 확인해 드릴게요.',
        },
    ]);
    const [input, setInput] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(initialClassId);
    const [classesLoaded, setClassesLoaded] = useState(false);
    const [classLoadError, setClassLoadError] = useState('');
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const launcherRef = useRef(null);
    const inputRef = useRef(null);
    const messagesRef = useRef(null);
    const isSendingRef = useRef(false);
    const requestControllerRef = useRef(null);

    useEffect(() => () => requestControllerRef.current?.abort(), []);

    useEffect(() => {
        if (initialClassId && classes.some((item) => item.id === initialClassId)) {
            setSelectedClassId(initialClassId);
        }
    }, [initialClassId, classes]);

    useEffect(() => {
        if (!isOpen || classesLoaded) return undefined;

        const controller = new AbortController();
        setIsLoadingClasses(true);
        setClassLoadError('');

        listChatbotClasses({ signal: controller.signal })
            .then((data) => {
                const nextClasses = normalizeClasses(data);
                setClasses(nextClasses);
                setClassesLoaded(true);

                if (initialClassId && nextClasses.some((item) => item.id === initialClassId)) {
                    setSelectedClassId(initialClassId);
                } else if (selectedClassId && !nextClasses.some((item) => item.id === selectedClassId)) {
                    setSelectedClassId('');
                }
            })
            .catch((error) => {
                if (error?.name !== 'AbortError') {
                    setClassLoadError(error.message || '수업 목록을 불러오지 못했습니다.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoadingClasses(false);
            });

        return () => controller.abort();
    }, [isOpen, classesLoaded, initialClassId, selectedClassId]);

    useEffect(() => {
        if (!isOpen) return undefined;

        inputRef.current?.focus();
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                launcherRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages, isSending]);

    async function sendMessage(value = input) {
        const text = value.trim();
        if (!text || isSendingRef.current) return;

        setMessages((previous) => [...previous, {
            id: makeMessageId(),
            role: 'user',
            text,
        }]);
        setInput('');
        isSendingRef.current = true;
        setIsSending(true);
        const controller = new AbortController();
        requestControllerRef.current = controller;

        try {
            const result = await queryChatbot({
                message: text,
                classId: selectedClassId,
                signal: controller.signal,
            });
            setMessages((previous) => [...previous, {
                id: makeMessageId(),
                role: 'assistant',
                text: result?.message || '답변을 가져오지 못했습니다. 다시 질문해주세요.',
                result,
            }]);
        } catch (error) {
            if (error?.name === 'AbortError') return;

            const text = error?.status === 403
                ? '권한이 없어 조회할 수 없습니다. 선생님 계정과 선택한 수업을 확인해주세요.'
                : error?.status === 401
                    ? '로그인이 만료되었습니다. 다시 로그인한 뒤 이용해주세요.'
                    : error?.message || '답변을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.';

            setMessages((previous) => [...previous, {
                id: makeMessageId(),
                role: 'assistant',
                text,
                isError: true,
            }]);
        } finally {
            isSendingRef.current = false;
            requestControllerRef.current = null;
            if (!controller.signal.aborted) {
                setIsSending(false);
                inputRef.current?.focus();
            }
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        sendMessage();
    }

    function handleInputKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    return (
        <div className="teacher-chatbot">
            {isOpen && (
                <section
                    id="teacher-chatbot-panel"
                    className="teacher-chatbot__panel"
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="teacher-chatbot-title"
                >
                    <header className="teacher-chatbot__header">
                        <div className="teacher-chatbot__brand">
                            <span className="teacher-chatbot__brand-icon"><ChatbotIcon /></span>
                            <div>
                                <h2 id="teacher-chatbot-title">Refit AI</h2>
                                <p>선생님을 위한 출결·보강 도우미</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="teacher-chatbot__close"
                            onClick={() => {
                                setIsOpen(false);
                                launcherRef.current?.focus();
                            }}
                            aria-label="Refit AI 닫기"
                        >
                            <CloseIcon />
                        </button>
                    </header>

                    <div className="teacher-chatbot__context">
                        <label htmlFor="teacher-chatbot-class">수업</label>
                        <select
                            id="teacher-chatbot-class"
                            value={selectedClassId}
                            onChange={(event) => setSelectedClassId(event.target.value)}
                            disabled={isLoadingClasses || classes.length === 0}
                        >
                            <option value="">전체 수업</option>
                            {classes.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="teacher-chatbot__messages" ref={messagesRef} aria-live="polite" aria-relevant="additions text">
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}

                        {messages.length === 1 && (
                            <div className="teacher-chatbot__quick-questions" aria-label="빠른 질문">
                                <p>이렇게 물어볼 수 있어요</p>
                                {QUICK_QUESTIONS.map((question) => (
                                    <button
                                        type="button"
                                        key={question}
                                        onClick={() => sendMessage(question)}
                                        disabled={isSending}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isSending && (
                            <p className="teacher-chatbot__loading" role="status">답변을 확인하고 있어요</p>
                        )}
                    </div>

                    {classLoadError && <p className="teacher-chatbot__notice" role="status">{classLoadError}</p>}

                    <form className="teacher-chatbot__composer" onSubmit={handleSubmit}>
                        <label className="teacher-chatbot__sr-only" htmlFor="teacher-chatbot-input">
                            선생님에게 질문하기
                        </label>
                        <textarea
                            ref={inputRef}
                            id="teacher-chatbot-input"
                            value={input}
                            maxLength={200}
                            rows={1}
                            placeholder="학생 이름이나 궁금한 내용을 입력하세요"
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={handleInputKeyDown}
                            disabled={isSending}
                        />
                        <div className="teacher-chatbot__composer-actions">
                            <span>{input.length}/200 · Enter로 전송</span>
                            <button
                                type="submit"
                                disabled={!input.trim() || isSending}
                                aria-label="질문 전송"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <button
                type="button"
                ref={launcherRef}
                className={`teacher-chatbot__launcher${isOpen ? ' is-open' : ''}`}
                aria-expanded={isOpen}
                aria-controls={isOpen ? 'teacher-chatbot-panel' : undefined}
                aria-label={isOpen ? 'Refit AI 닫기' : 'Refit AI 열기'}
                onClick={() => setIsOpen((previous) => !previous)}
            >
                <ChatbotIcon />
                <span>Refit AI</span>
            </button>
        </div>
    );
}
