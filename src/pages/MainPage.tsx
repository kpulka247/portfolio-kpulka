import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import ReactGA from "react-ga4";
import { motion, AnimatePresence, useInView } from "framer-motion";

import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import Footer from '../components/Footer';
import InteractiveBg from '../components/InteractiveBg';
import CookieBanner from '../components/CookieBanner';
import FullPageLoader, { Spinner } from '../components/Loader';
import { fade, fadeIn } from "../utils/animations";

const Skills = lazy(() => import('../sections/Skills'));
const Projects = lazy(() => import('../sections/Projects'));
const About = lazy(() => import('../sections/About'));
const Contact = lazy(() => import('../sections/Contact'));

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const SectionController: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.div
            ref={ref}
            variants={fadeIn}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
        >
            {children}
        </motion.div>
    );
};

const MainPage = () => {
    const mousePosRef = useRef({ x: 0.5, y: 0.5 });
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isSimulationActive, setSimulationActive] = useState(true);
    const [isBgReady, setIsBgReady] = useState(false);

    const handleBgReady = () => {
        setIsBgReady(true);
    };

    useEffect(() => {
        if (GA_MEASUREMENT_ID) {
            ReactGA.initialize(GA_MEASUREMENT_ID);
        }
    }, []);

    useEffect(() => {
        const updatePosition = (clientX: number, clientY: number) => {
            if (!hasInteracted) setHasInteracted(true);
            mousePosRef.current = {
                x: clientX / window.innerWidth,
                y: clientY / window.innerHeight,
            };
        };

        const handleMouseMove = (event: MouseEvent) => updatePosition(event.clientX, event.clientY);
        const handleTouchMove = (event: TouchEvent) => {
            if (event.touches.length > 0) updatePosition(event.touches[0].clientX, event.touches[0].clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [hasInteracted]);

    const handleHeroVisibilityChange = (isVisible: boolean) => {
        setSimulationActive(isVisible);
    };

    const sectionLoader = <div className="flex justify-center py-10 md:py-20"><Spinner /></div>;

    return (
        <>
            <AnimatePresence>
                {!isBgReady && <FullPageLoader />}
            </AnimatePresence>

            <motion.div
                variants={fade}
                initial="hidden"
                animate="visible"
                className="text-zinc-800 antialiased min-h-screen flex flex-col"
            >
                <Navbar />
                <main className="flex-grow relative">
                    <div className="relative z-10" style={{ isolation: 'isolate' }}>
                        <InteractiveBg
                            mousePosRef={mousePosRef}
                            hasInteracted={hasInteracted}
                            isSimulationActive={isSimulationActive}
                            onReady={handleBgReady}
                        />
                        <Hero onVisibilityChange={handleHeroVisibilityChange} />
                    </div>
                    <div id="main-page" className="z-20 bg-black text-zinc-300 rounded-t-4xl relative">
                        <Suspense fallback={sectionLoader}>
                            <SectionController>
                                <Skills />
                            </SectionController>
                        </Suspense>
                        <Suspense fallback={sectionLoader}>
                            <SectionController>
                                <Projects />
                            </SectionController>
                        </Suspense>
                        <Suspense fallback={sectionLoader}>
                            <SectionController>
                                <About />
                            </SectionController>
                        </Suspense>
                        <Suspense fallback={sectionLoader}>
                            <SectionController>
                                <Contact />
                            </SectionController>
                        </Suspense>
                    </div>
                </main>
                <Footer />
            </motion.div>

            <CookieBanner />
        </>
    );
};

export default MainPage;