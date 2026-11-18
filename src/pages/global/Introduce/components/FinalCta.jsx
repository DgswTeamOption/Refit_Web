import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { copy } from '../copy.js';
import { StartLink } from './Parts.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCta() {
    const root = useRef(null);

    useLayoutEffect(() => {
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
            const timeline = gsap.timeline({
                scrollTrigger: { trigger: root.current, start: 'top 55%', end: 'bottom bottom', scrub: true },
            });
            timeline.from('.ri-final-wave i', { scale: 0.32, opacity: 0, stagger: 0.09, duration: 0.75 }, 0)
                .from('.ri-final-line', { yPercent: 105, duration: 0.34, stagger: 0.065, ease: 'power2.out' }, 0.05)
                .from('.ri-final-description', { opacity: 0, y: 14, duration: 0.26 }, 0.38)
                .from('.ri-final-action', { y: 18, duration: 0.3 }, 0.55);
        }, root);
        return () => media.revert();
    }, []);

    return (
        <section className="ri-final" ref={root}>
            <div className="ri-final-stage">
                <div className="ri-final-wave" aria-hidden="true"><i /><i /><i /></div>
                <div className="ri-wrap ri-final-copy">
                    <h2>
                        {['wide', 'small'].map(size => (
                            <span className={'ri-' + size} key={size}>
                                {copy.final[size][0].split('\n').map(line => (
                                    <span className="ri-final-mask" key={line}><span className="ri-final-line">{line}</span></span>
                                ))}
                            </span>
                        ))}
                    </h2>
                    <p className="ri-final-description">
                        <span className="ri-wide">{copy.final.wide[1]}</span>
                        <span className="ri-small">{copy.final.small[1]}</span>
                    </p>
                    <div className="ri-final-action"><StartLink /></div>
                </div>
            </div>
        </section>
    );
}
