import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import IntroPhone from './IntroPhone.jsx';
import { Heading, StartLink } from './Parts.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const root = useRef(null);
    useLayoutEffect(() => {
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
            const intro = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.65 } });
            intro.from('.ri-title', { y: 24 })
                .from('.ri-description, .ri-hero-actions', { y: 14, opacity: 0, stagger: 0.1 }, 0.13)
                .from('.ri-hero-phone', { y: 26, stagger: 0.13 }, 0.22);

            gsap.to('.ri-hero-phone .ri-handset', {
                yPercent: index => index === 0 ? -3 : 3, ease: 'none',
                scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
            });
        }, root);
        return () => media.revert();
    }, []);

    return (
        <section id="overview" className="ri-hero" ref={root}>
            <div className="ri-wrap ri-hero-layout">
                <div>
                    <Heading section="hero" />
                    <div className="ri-hero-actions">
                        <StartLink />
                        <Link to="#problem">기능 둘러보기 <span aria-hidden="true">↓</span></Link>
                    </div>
                </div>
                <div className="ri-hero-stage">
                    <div className="ri-hero-phone ri-hero-phone--back"><IntroPhone name="nfc" eager /></div>
                    <div className="ri-hero-phone ri-hero-phone--front"><IntroPhone name="calendar" eager priority /></div>
                </div>
            </div>
        </section>
    );
}
