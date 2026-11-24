import { useEffect, useRef, useState } from 'react';
import { listChatbotClasses, queryChatbot } from '../../api/chatbot.js';
import refitAiIcon from '../../assets/RefitAI.svg';
import './TeacherChatbot.css';

const QUICK_QUESTIONS = [
    { label: '학생 개인 정보 한눈에 보기', prompt: '학생 개인 정보를 한눈에 보여줘' },
    { label: '이번 달 결석·보강 현황', prompt: '이번 달 결석과 보강 현황을 알려줘' },
    { label: '보강 시간을 제안하지 않은 학생', prompt: '보강 시간을 제안하지 않은 학생을 알려줘' },
    { label: '보강 시간 추천받기', prompt: '신청이 많은 보강 시간을 추천해줘' },
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
    return (
        <article className={`teacher-chatbot__message teacher-chatbot__message--${message.role}${message.isError ? ' is-error' : ''}`}>
            <div className="teacher-chatbot__bubble">
                {message.greeting && <h3 className="teacher-chatbot__greeting">{message.greeting}</h3>}
                {message.text && <p>{message.text}</p>}
                {message.feature && (
                    <div className="teacher-chatbot__welcome-card">
                        <strong>{message.feature.title}</strong>
                        <p>{message.feature.description}</p>
                    </div>
                )}
                {message.role === 'assistant' && <ResultDetails result={message.result} />}
            </div>
        </article>
    );
}

function MinimizeIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function ChevronRightIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function TeacherChatbot({ initialClassId = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            greeting: '안녕하세요, 선생님.',
            text: '학생의 출결 확인부터 보강 일정까지,\n필요한 정보를 바로 찾아드릴게요.',
            feature: {
                title: '출결과 보강을 한곳에서',
                description: '출석·결석·보강 현황을 확인하고 우리 수업에 맞는 보강 시간을 찾아보세요.',
            },
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
                            <span className="teacher-chatbot__brand-icon" aria-hidden="true">
                                <img src={refitAiIcon} alt="" width="42" height="42" />
                            </span>
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
                            aria-label="Refit AI 최소화"
                        >
                            <MinimizeIcon />
                        </button>
                    </header>

                    <div className="teacher-chatbot__messages" ref={messagesRef} aria-live="polite" aria-relevant="additions text">
                        {classes.length > 0 && (
                            <div className="teacher-chatbot__context">
                                <label htmlFor="teacher-chatbot-class">수업 범위</label>
                                <select
                                    id="teacher-chatbot-class"
                                    value={selectedClassId}
                                    onChange={(event) => setSelectedClassId(event.target.value)}
                                    disabled={isLoadingClasses}
                                >
                                    <option value="">전체 수업</option>
                                    {classes.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}

                        {messages.length === 1 && (
                            <div className="teacher-chatbot__quick-questions" aria-label="빠른 질문">
                                <p>무엇을 도와드릴까요?</p>
                                {QUICK_QUESTIONS.map((question, index) => (
                                    <button
                                        type="button"
                                        key={question.label}
                                        onClick={() => sendMessage(question.prompt)}
                                        disabled={isSending}
                                    >
                                        <span className="teacher-chatbot__quick-number">{String(index + 1).padStart(2, '0')}</span>
                                        <span>{question.label}</span>
                                        <ChevronRightIcon />
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
                {isOpen ? (
                    <CloseIcon />
                ) : (
                    <span className="teacher-chatbot__launcher-mark" aria-hidden="true">
                        <img src={refitAiIcon} alt="" width="52" height="52" />
                    </span>
                )}
            </button>
        </div>
    );
}
