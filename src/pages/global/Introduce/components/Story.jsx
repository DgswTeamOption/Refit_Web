import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heading } from './Parts.jsx';
import { Screen } from './Screen.jsx';
import '../story.css';

gsap.registerPlugin(ScrollTrigger);

const messages = [
    ['학생 · 월요일', '16:08', '이번 주 보강 가능해요?'],
    ['선생님 · 화요일', '18:42', '가능한 시간을 다시 알려주세요'],
    ['학생 · 수요일', '09:13', '지난번 출석도 확인했어요?'],
];

const steps = [
    {
        image: 'email', title: '이메일로 인증코드 받기', alt: '이메일 입력란과 인증코드 칸',
        description: '비밀번호 없이 이메일로 6자리 인증코드를 받아요',
    },
    {
        image: 'role', title: '역할 선택하기', alt: '학생과 선생님 역할 선택 화면',
        description: '학생이나 선생님을 선택하면 역할에 맞는 화면으로 이동해요',
    },
    {
        image: 'join', title: '수업 만들기 · 참여하기', alt: '수업 코드 입력 후 영어1 수업에 참여한 화면',
        description: '선생님은 수업을 만들고, 학생은 수업 코드만 입력하면 바로 참여 끝!',
    },
];

function Problem() {
    return (
        <section id="problem" className="ri-problem">
            <div className="ri-wrap">
                <div className="ri-problem__layout">
                    <Heading section="problem" />
                    <ol className="ri-messages">
                        {messages.map(([who, time, message]) => (
                            <li key={who}>
                                <div className="ri-message">
                                    <small>{who}<span className="ri-wide"> {time}</span></small>
                                    <p>{message}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

function Solution() {
    return (
        <section className="ri-solution">
            <div className="ri-wrap">
                <Heading section="solution" />
                <ol className="ri-solution__path">
                    <li><span>01</span> <span className="ri-small">보강 </span>가능 시간 등록</li>
                    <li><span>02</span> 보강 요청 확인</li>
                    <li><span>03</span> <span className="ri-wide">시간표 관리</span><span className="ri-small">시간표에서 일정 관리</span></li>
                </ol>
                <Screen className="ri-solution__screen ri-product" name="schedule" mobile="mobileSolution" alt="학생별 요일과 수업 시간을 함께 보여주는 리핏 시간표" />
            </div>
        </section>
    );
}

function Features() {
    return (
        <section id="features" className="ri-features">
            <div className="ri-wrap">
                <Heading section="features" />
                <article className="ri-feature-schedule">

                    <h3><span className="ri-wide">요일별 시간표를 한눈에</span><span className="ri-small">학생별 시간표 관리</span></h3>
                    <Screen className="ri-product" name="schedule" mobile="mobileSchedule" alt="영어1 수업의 학생별 시간표와 등록 화면" />
                </article>
                <div className="ri-feature-grid">
                    <article className="ri-feature-card">

                        <h3><span className="ri-wide">개설한 수업을 한곳에서</span><span className="ri-small">수업을 한곳에서</span></h3>
                        <p className="ri-wide">월별 일정과 수업을 확인하고, 새 수업을 만드세요</p>
                        <Screen className="ri-product" name="classes" mobile="mobileClasses" alt="내 수업에 개설된 영어와 수학 수업 카드" />
                    </article>
                    <article className="ri-feature-card">

                        <h3><span className="ri-wide">학생별 보강 현황까지</span><span className="ri-small">학생별 결석·보강 확인</span></h3>
                        <p className="ri-wide">학생을 검색하고, 결석·보강 필요 일수를 확인하세요</p>
                        <Screen className="ri-product" name="students" mobile="mobileStudents" alt="학생 검색과 학생별 결석·보강 필요 횟수" />
                    </article>
                </div>
            </div>
        </section>
    );
}

function GetStarted() {
    return (
        <section id="start" className="ri-start">
            <div className="ri-wrap">
                <Heading section="start" />
                <ol className="ri-steps">
                    {steps.map((step, index) => (
                        <li className="ri-step" key={step.image}>
                            <p className="ri-kicker">STEP 0{index + 1}</p>
                            <Screen name={step.image} alt={step.alt} />
                            <h3>{step.title}</h3>
                            <p className="ri-step__description">{step.description}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

function Ai() {
    return (
        <section id="ai" className="ri-ai">
            <div className="ri-wrap">
                <Heading section="ai" />
                <div className="ri-ai__details ri-wide">
                    <ol>
                        <li>월별 결석·보강 현황 확인</li>
                        <li>보강 시간 미제안 학생 확인</li>
                        <li>학생 신청이 많은 보강 시간 추천</li>
                    </ol>
                </div>
                <div className="ri-chat">
                    <Screen name="ai" alt="보강 시간 추천 대화 금요일 18시부터 19시까지 12명, 목요일 19시부터 20시까지 9명, 토요일 10시부터 11시까지 7명이 신청했어요" />
                    <div className="ri-chat__mask ri-chat__mask--question" aria-hidden="true" />
                    <div className="ri-chat__mask ri-chat__mask--answer" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}

function animateStory(container) {
    const find = gsap.utils.selector(container);
    const messages = find('.ri-message');
    const enterMessages = gsap.timeline({
        scrollTrigger: { trigger: messages[0], start: 'top 90%', endTrigger: messages.at(-1), end: 'center 70%', scrub: true },
    });
    messages.forEach((message, index) => {
        enterMessages.from(message, {
            xPercent: index === 1 ? 12 : -10,
            y: 22, rotation: index === 1 ? 2 : -2, opacity: 0,
            duration: 0.65, ease: 'power2.out',
        }, index * 0.43);
    });
    gsap.to(find('.ri-messages > li'), {
        x: index => [18, -32, 24][index], scale: 0.97, stagger: 0.06,
        scrollTrigger: { trigger: '.ri-problem', start: 'bottom 85%', end: 'bottom top', scrub: true },
    });

    gsap.from('.ri-solution__screen', {
        y: 36, scale: 0.94, transformOrigin: '50% 30%', ease: 'power2.out',
        scrollTrigger: { trigger: '.ri-solution__screen', start: 'top 95%', end: 'center 65%', scrub: true },
    });
    gsap.from('.ri-feature-schedule .ri-product', {
        scale: 0.975, opacity: 0.35, ease: 'power2.out',
        scrollTrigger: { trigger: '.ri-feature-schedule', start: 'top 85%', end: 'center 70%', scrub: true },
    });
    find('.ri-feature-card').forEach((card, index) => {
        gsap.from(card, {
            x: index ? 18 : -18, y: 24, opacity: 0, duration: 0.55, delay: index * 0.09,
            scrollTrigger: { trigger: card, start: 'top 93%', toggleActions: 'play none none reverse' },
        });
    });
    const steps = find('.ri-step');
    gsap.from(steps, {
        y: 24, opacity: 0, duration: 0.7, stagger: 1, ease: 'power1.out',
        scrollTrigger: {
            trigger: '.ri-steps', start: 'top 88%',
            endTrigger: steps.at(-1), end: 'top 32%', scrub: true,
        },
    });

    const chat = find('.ri-chat')[0];
    const conversation = gsap.timeline({
        scrollTrigger: { trigger: chat, start: 'top 80%', end: 'center 56%', scrub: true },
    });
    // Reveal the original conversation in place so the recommended hours and counts match the product.
    conversation.fromTo('.ri-chat__mask--question', { scaleY: 1 }, { scaleY: 0, duration: 0.25 }, 0)
        .fromTo('.ri-chat__mask--answer', { scaleY: 1 }, { scaleY: 0, duration: 0.65 }, 0.35)
        .fromTo(chat, { y: 15 }, { y: -6, duration: 1, ease: 'none' }, 0);
}

export default function Story() {
    const container = useRef(null);
    useLayoutEffect(() => {
        const motion = gsap.matchMedia();
        motion.add('(prefers-reduced-motion: no-preference)', () => {
            animateStory(container.current);
        }, container);
        return () => motion.revert();
    }, []);

    return (
        <div className="ri-story" ref={container}>
            <Problem />
            <Solution />
            <Features />
            <GetStarted />
            <Ai />
        </div>
    );
}
