import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import photo1 from '/static/images/photo1.jpg';
import { fadeIn } from '../utils/animations';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Photo */}
          <motion.div
            className="flex justify-center"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <img
              src={photo1}
              alt="Photo 1"
              className="opacity-80 rounded-xl shadow-lg w-72 h-auto object-cover"
            />
          </motion.div>

          {/* Text */}
          <div>
            <div className="text-left mb-6">
              <SectionHeader
                title="ABOUT ME"
                subtitle="Who am I and what do I do?"
                fileName="About"
              />
            </div>
            <p className="text-md leading-relaxed mb-4">
              I’m a passionate web developer from Poland who loves building modern web
              applications, experimenting with new technologies and creating
              clean, user-friendly designs. My journey started with simple
              websites, browser extensions, and now I’m diving deep into frameworks, 3D graphics, and
              automation.
            </p>
            <p className="text-md leading-relaxed">
              Outside of coding I enjoy computer games, both story-driven and competitive.
              I also like being active outdoors, from cycling to snowboarding. Coding itself
              feels a bit like gaming, solving challenges, leveling up skills, and building
              things I’m proud of.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;