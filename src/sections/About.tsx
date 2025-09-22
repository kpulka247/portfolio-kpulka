import React from 'react';
import SectionHeader from '../components/SectionHeader';

const About: React.FC = () => {
  return (
    <section id="about" className="bg-zinc-800 py-20 text-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <SectionHeader title="About Me" subtitle="Who am I and what do I do?" />
      </div>
    </section>
  );
};

export default About;