import React, { useState, useMemo, useRef, useEffect } from 'react';
import ScrollLink from '../components/ScrollLink';
import TypingEffect from '../components/TypingEffect';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { BsArrowDown } from "react-icons/bs";
import { motion, useScroll, useTransform } from "framer-motion";
import { titleContainer, scrollLetterJump } from '../utils/animations';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { trackEvent } from '../utils/analytics';

interface HeroProps {
    onVisibilityChange: (isVisible: boolean) => void;
}

const RepeatScrollAnimation: React.FC<{ text: string }> = ({ text }) => {
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setAnimationKey(prevKey => prevKey + 1);
        }, 3000); // Co 3 sekundy

        return () => clearInterval(intervalId);
    }, []);

    const letters = text.split('');

    return (
        <motion.div
            key={animationKey}
            className="font-semibold tracking-wider uppercase text-white flex justify-center"
            variants={titleContainer}
            initial="hidden"
            animate="visible"
            aria-label={text}
        >
            {letters.map((char, index) => (
                <motion.span
                    key={index}
                    variants={scrollLetterJump}
                    className="inline-block"
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.div>
    );
};

const Hero: React.FC<HeroProps> = ({ onVisibilityChange }) => {
    const heroRef = useRef<HTMLElement>(null);
    const animatedText = useTypingEffect();

    const isTouchDevice = useMemo(() => {
        if (typeof window !== 'undefined') {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
        return false;
    }, []);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.25, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

    const motionStyle = { opacity, y, scale };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                onVisibilityChange(entry.isIntersecting);
            },
            { root: null, rootMargin: '0px', threshold: 0.0 }
        );
        const currentRef = heroRef.current;
        if (currentRef) { observer.observe(currentRef); }
        return () => { if (currentRef) { observer.unobserve(currentRef); } };
    }, [onVisibilityChange]);

    useEffect(() => {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouchDevice) return;

        const preventScroll = (e: TouchEvent) => e.preventDefault();
        const body = document.body;

        const handleScroll = () => {
            if (window.scrollY === 0) {
                body.addEventListener('touchmove', preventScroll, { passive: false });
                body.style.overscrollBehavior = 'none';
            } else {
                body.removeEventListener('touchmove', preventScroll);
                body.style.overscrollBehavior = 'auto';
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            body.removeEventListener('touchmove', preventScroll);
            body.style.overscrollBehavior = 'auto';
        };
    }, []);

    const handleGitHubClick = () => {
        trackEvent('Contact', 'Click Icon', 'GitHub');
    };

    const handleLinkedInClick = () => {
        trackEvent('Contact', 'Click Icon', 'LinkedIn');
    };

    return (
        <section
            ref={heroRef}
            id="hello"
            className="relative h-screen"
        >
            {/* --- LAYER A: No blend --- */}
            <motion.div
                className="fixed inset-0 flex flex-col items-center justify-start pt-[16vh] sm:justify-center sm:pt-0"
                style={motionStyle}
            >
                <div className="pointer-events-auto container mx-auto text-center px-4">
                    <h1 className="flex flex-col md:flex-row justify-center items-center text-4xl xs:text-5xl md:text-6xl lg:text-7xl text-zinc-800 font-extrabold leading-tight mb-4">
                        <span>Hi, I'm&nbsp;</span>
                        <span className="invisible"><TypingEffect text={animatedText} /></span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-zinc-800 mb-8 max-w-2xl mx-auto">
                        A passionate web developer specializing in building modern web applications.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xs sm:max-w-none sm:w-auto">
                            <ScrollLink to="projects" className="bg-zinc-800 hover:bg-black text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block">VIEW MY WORK</ScrollLink>
                            <ScrollLink to="contact" className="border-2 border-zinc-800 text-zinc-800 hover:text-black hover:border-black font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block">CONTACT ME</ScrollLink>
                        </div>
                        <div className="flex space-x-4 mt-4 sm:mt-0">
                            <a href="https://github.com/kpulka247"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-800 hover:text-black transition duration-300 transform hover:scale-110"
                                aria-label="GitHub Profile"
                                onClick={handleGitHubClick}
                            >
                                <FaGithub size={30} />
                            </a>
                            <a href="https://www.linkedin.com/in/kpulka247/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-800 hover:text-black transition duration-300 transform hover:scale-110"
                                aria-label="LinkedIn Profile"
                                onClick={handleLinkedInClick}
                            >
                                <FaLinkedin size={30} />
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- LAYER B: `mix-blend-mode` --- */}
            <motion.div
                className="fixed inset-0 flex flex-col items-center justify-start pt-[16vh] sm:justify-center sm:pt-0 mix-blend-difference pointer-events-none"
                style={motionStyle}
            >
                <div className="container mx-auto text-center px-4">
                    <h1 className="flex flex-col md:flex-row justify-center items-center text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 text-white">
                        <span className="invisible">Hi, I'm&nbsp;</span>
                        <span><TypingEffect text={animatedText} /></span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl mx-auto invisible">
                        A passionate web developer specializing in building modern web applications.
                    </p>
                    <div className="invisible flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xs sm:max-w-none sm:w-auto">
                            <ScrollLink to="projects" className="bg-zinc-800 hover:bg-black text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block">VIEW MY WORK</ScrollLink>
                            <ScrollLink to="contact" className="border-2 border-zinc-800 text-zinc-800 hover:text-black hover:border-black font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block">CONTACT ME</ScrollLink>
                        </div>
                        <div className="flex space-x-4 mt-4 sm:mt-0">
                            <a href="https://github.com/kpulka247"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaGithub size={30} /></a>
                            <a href="https://www.linkedin.com/in/kpulka247/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaLinkedin size={30} /></a>
                        </div>
                    </div>
                </div>
                <div className="pointer-events-auto absolute bottom-32 md:bottom-18">
                    <ScrollLink to="skills" className="text-white cursor-pointer p-2" aria-label="Scroll to Skills">

                        {isTouchDevice ? (
                            <RepeatScrollAnimation text="CLICK TO SCROLL" />
                        ) : (
                            <motion.div
                                className="text-white"
                                animate={{ y: [0, 10, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "easeInOut"
                                }}
                            >
                                <BsArrowDown size={30} />
                            </motion.div>
                        )}

                    </ScrollLink>
                </div>
            </motion.div>
            <div aria-hidden className="h-screen" />
        </section>
    );
};

export default Hero;