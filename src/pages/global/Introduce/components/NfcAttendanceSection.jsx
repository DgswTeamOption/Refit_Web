import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heading, StartLink } from './Parts.jsx';
import { Screen } from './Screen.jsx';
import IntroPhone from './IntroPhone.jsx';

gsap.registerPlugin(ScrollTrigger);

function NfcTag() {
    return (
        <div className="ri-tag" aria-hidden="true">
            <div className="ri-tag__face">
                <img src="/logo.svg" alt="" width="48" height="23" />
                <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                    <path d="M9 14 Q32 -7 55 14 M16 20 Q32 5 48 20 M23 26 Q32 17 41 26 M31 32h2" />
                </svg>
                <span>NFC</span>
            </div>
        </div>
    );
}

function useNfcMotion(stage, setComplete) {
    useLayoutEffect(() => {
        const scene = stage.current;
        const phone = scene.querySelector('[data-nfc-phone]');
        const tag = scene.querySelector('[data-nfc-tag]');
        const rings = scene.querySelectorAll('.ri-pulse');
        const toast = scene.querySelector('[data-nfc-toast]');
        const action = scene.querySelector('[data-nfc-action]');
        const media = gsap.matchMedia();
        media.add({
            regular: '(prefers-reduced-motion: no-preference)',
            reduced: '(prefers-reduced-motion: reduce)',
            narrow: '(max-width: 767px)',
        }, ({ conditions }) => {
            if (conditions.reduced) {
                setComplete(true);
                gsap.set(toast, { autoAlpha: 1 });
                gsap.set(action, { backgroundColor: '#087956' });
                return;
            }
            const offerModel = scene.querySelector('.ri-free-tag__model');
            gsap.fromTo(offerModel, { rotation: -6, y: 8 }, {
                rotation: 4, y: -5, ease: 'none',
                scrollTrigger: { trigger: offerModel, start: 'top bottom', end: 'bottom center', scrub: true },
            });
            let previous = false;
            setComplete(previous);
            // A single normalized timeline owns the position, recognition pulse, status and feedback.
            const pinTarget = conditions.narrow ? scene.querySelector('.ri-nfc-interaction') : scene;
            const timeline = gsap.timeline({
                defaults: { ease: 'none' },
                onUpdate() {
                    const complete = this.time() >= 0.75;
                    if (complete !== previous) {
                        previous = complete;
                        setComplete(complete);
                    }
                },
                scrollTrigger: {
                    trigger: pinTarget, pin: true, start: 'top top',
                    end: () => '+=' + Math.round(window.innerHeight * (conditions.narrow ? 0.85 : 1.35)),
                    scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
                },
            });
            const contactX = () => tag.offsetLeft - phone.offsetLeft - phone.offsetWidth * 0.92;
            timeline
                .fromTo(phone, { opacity: 0.35, rotationY: -14, rotationZ: -5, y: 10 },
                    { opacity: 1, y: 0, duration: 0.2 }, 0)
                .fromTo(tag, { opacity: 0.52, scale: 0.93 }, { opacity: 1, scale: 1, duration: 0.2 }, 0)
                .fromTo(phone, { x: 0 }, { x: contactX, rotationY: 4, rotationZ: 1, duration: 0.5, ease: 'sine.inOut', immediateRender: false }, 0.2)
                .fromTo(rings, { scale: 0.68, opacity: 0 }, { scale: 1.6, opacity: 0.8, stagger: 0.05, duration: 0.15 }, 0.38)
                .to(rings, { scale: 2.2, opacity: 0, stagger: 0.04, duration: 0.22 }, 0.58)
                .to(tag, { scale: 1.05, duration: 0.055, repeat: 1, yoyo: true }, 0.64)
                .to(action, { backgroundColor: '#087956', duration: 0.09 }, 0.75)
                .fromTo(toast, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.75)
                .to({}, { duration: 0.1 }, 0.90);
        }, stage);
        return () => media.revert();
    }, [stage, setComplete]);
}

export default function NfcAttendanceSection() {
    const stage = useRef(null);
    const [complete, setComplete] = useState(false);
    useNfcMotion(stage, setComplete);

    return (
        <section id="nfc" className="ri-nfc">
            <div className="ri-nfc-stage" ref={stage}>
                <div className="ri-wrap ri-nfc-stage__inner">
                    <div className="ri-nfc-interaction">
                        <div className="ri-nfc-copy">
                            <Heading section="nfc" />
                            <ol className="ri-nfc-steps">
                                <li><strong>학생</strong>스마트폰을 태그에 가까이</li>
                                <li><strong>학생</strong>출석 완료 상태 확인</li>
                                <li><strong>선생님</strong>수업별 출석 기록 확인</li>
                            </ol>
                        </div>
                        <div className="ri-nfc-devices">
                            <div data-nfc-phone="" className="ri-scene-phone"><IntroPhone attendance complete={complete} /></div>
                            <div data-nfc-tag="" className="ri-scene-tag">
                                <i className="ri-pulse" aria-hidden="true" /><i className="ri-pulse" aria-hidden="true" /><NfcTag />
                            </div>
                            <p data-nfc-toast="" className="ri-nfc-toast" aria-hidden="true"><b>✓</b> 출석이 완료되었습니다</p>
                        </div>
                    </div>
                    <aside className="ri-free-tag">
                        <div><h3>학원에 필요한 NFC 태그,<br />무료로 제공합니다</h3>
                            <p>출석을 시작할 수 있도록 학원용 태그를 함께 제공해요</p>
                            <StartLink /></div>
                        <div className="ri-free-tag__model"><NfcTag /></div>
                    </aside>
                </div>
            </div>
            <div className="ri-wrap ri-nfc-record">
                <p className="ri-kicker"><span className="ri-wide">수업별 출석 상태</span><span className="ri-small">실제 출석 관리</span></p>
                <Screen className="ri-record-screen" name="attendance" mobile="mobileAttendance" alt="선생님용 영어1 출석 관리 화면 학생별 출석 상태를 확인하고 수정할 수 있어요" />
            </div>
        </section>
    );
}
