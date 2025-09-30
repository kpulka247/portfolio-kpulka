import React, { useRef, useEffect } from 'react';
import ScrollLink from '../components/ScrollLink';
import TypingEffect from '../components/TypingEffect';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTypingEffect } from '../hooks/useTypingEffect';
import { trackEvent } from '../utils/analytics';

interface HeroProps {
    onVisibilityChange: (isVisible: boolean) => void;
}

const Hero: React.FC<HeroProps> = ({ onVisibilityChange }) => {
    const heroRef = useRef<HTMLElement>(null);

    const animatedText = useTypingEffect();

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
                className="fixed inset-0 flex items-center justify-center"
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
                className="fixed inset-0 flex items-center justify-center mix-blend-difference pointer-events-none"
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
            </motion.div>
            <div aria-hidden className="h-screen" />
        </section>
    );
};

export default Hero;