import { useState, useEffect, useRef } from 'react';
import ReactGA from "react-ga4";
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Contact from './sections/Contact';
import Footer from './components/Footer';
import InteractiveBg from './components/InteractiveBg';
import CookieBanner from './components/CookieBanner';
import PrivacyPolicy from './pages/PrivacyPolicy';

import { motion, AnimatePresence } from "framer-motion";
import { fade } from "./utils/animations";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const MainPage = () => {
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSimulationActive, setSimulationActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      ReactGA.initialize(GA_MEASUREMENT_ID);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timeout);
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

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            className="h-screen w-screen flex flex-col justify-center items-center bg-black fixed top-0 left-0 z-[100]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="w-12 h-12 border-4 border-t-transparent border-zinc-300 rounded-full animate-spin mb-4"
            />
            <p className="font-mono text-lg text-zinc-300">Loading...</p>
          </motion.div>
        )}
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
            />
            <Hero onVisibilityChange={handleHeroVisibilityChange} />
          </div>
          <div className="z-20 bg-black text-zinc-300 rounded-t-4xl relative">
            <Skills />
            <Projects />
            <About />
            <Contact />
          </div>
        </main>
        <Footer />
      </motion.div>

      <CookieBanner />
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default App;