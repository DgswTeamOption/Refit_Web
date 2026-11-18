import 'lenis/dist/lenis.css';
import './Introduce.css';
import Lenis from 'lenis';
import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './components/Hero.jsx';
import Story from './components/Story.jsx';
import NfcAttendanceSection from './components/NfcAttendanceSection.jsx';
import IntroPhone from './components/IntroPhone.jsx';
import FinalCta from './components/FinalCta.jsx';
import { Heading } from './components/Parts.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Introduce() {
    const { hash, key, pathname, search } = useLocation();
    const navigate = useNavigate();
    const scroller = useRef(null);

    useLayoutEffect(() => {
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
            const lenis = new Lenis({ lerp: 0.05, syncTouch: false });
            scroller.current = lenis;
            const tick = seconds => lenis.raf(seconds * 1000);
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(tick);
            return () => {
                gsap.ticker.remove(tick);
                lenis.destroy();
                scroller.current = null;
            };
        });
        return () => media.revert();
    }, []);

    useLayoutEffect(() => {
        const id = hash.slice(1);
        const pageLoad = performance.getEntriesByType('navigation')[0];
        if (pageLoad?.type === 'reload' && id) {
            navigate(pathname + search, { replace: true });
            scroller.current?.scrollTo(0, { immediate: true, force: true });
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            return;
        }
        if (!['overview', 'problem', 'features', 'start', 'ai', 'nfc'].includes(id)) return;
        const frame = requestAnimationFrame(() => {
            const target = document.getElementById(id);
            if (!target) return;
            if (scroller.current) scroller.current.scrollTo(target);
            else target.scrollIntoView({ behavior: 'instant' });
        });
        return () => cancelAnimationFrame(frame);
    }, [hash, key, navigate, pathname, search]);

    return (
        <main className="ri" id="intro-content">
            <Hero />
            <Story />
            <NfcAttendanceSection />
            <section className="ri-inside ri-small">
                <div className="ri-wrap">
                    <Heading section="inside" />
                    <div className="ri-inside-device"><IntroPhone name="student" /></div>
                </div>
            </section>
            <FinalCta />
        </main>
    );
}
