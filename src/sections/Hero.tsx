import React, { useRef, useEffect } from 'react';
import ScrollLink from '../components/ScrollLink';
import TypingEffect from '../components/TypingEffect';

interface HeroProps {
    onVisibilityChange: (isVisible: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ onVisibilityChange }) => {
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                onVisibilityChange(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.0
            }
        );

        const currentRef = heroRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [onVisibilityChange]);


    return (
        <section ref={heroRef} id="hello" className="relative h-screen flex items-center justify-center text-black overflow-hidden">
            <div className="relative container mx-auto text-center px-4 pointer-events-none">
                <h1 className="text-5xl md:text-7xl text-zinc-800 font-extrabold leading-tight mb-4">
                    Hi, I'm <span className="text-white mix-blend-difference"><TypingEffect /></span>
                </h1>
                <p className="text-xl md:text-2xl text-zinc-800 mb-8 max-w-2xl mx-auto">
                    A passionate web developer specializing in building modern web applications.
                </p>
                <div className="space-x-4">
                    <ScrollLink
                        to="projects"
                        className="bg-zinc-800 hover:bg-black text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block pointer-events-auto"
                    >
                        View My Work
                    </ScrollLink>
                    <ScrollLink
                        to="contact"
                        className="border-2 border-zinc-800 text-zinc-800 hover:text-black hover:border-black font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block pointer-events-auto"
                    >
                        Contact Me
                    </ScrollLink>
                </div>
            </div>
        </section>
    );
};

export default Hero;