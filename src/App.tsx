import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Contact from './sections/Contact';
import Footer from './components/Footer';
import InteractiveBg from './components/InteractiveBg';

function App() {
  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSimulationActive, setSimulationActive] = useState(true);

  useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      if (!hasInteracted) setHasInteracted(true);
      mousePosRef.current = {
        x: clientX / window.innerWidth,
        y: clientY / window.innerHeight,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        updatePosition(event.touches[0].clientX, event.touches[0].clientY);
      }
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
    <div className="text-zinc-800 antialiased min-h-screen flex flex-col">
      <InteractiveBg
        mousePosRef={mousePosRef}
        hasInteracted={hasInteracted}
        isSimulationActive={isSimulationActive}
      />
      <Navbar />
      <main className="flex-grow relative">
        <Hero onVisibilityChange={handleHeroVisibilityChange} />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;