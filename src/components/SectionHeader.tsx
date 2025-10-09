import React from "react";
import { motion } from "framer-motion";
import {
  fadeUpDelayed,
  titleContainer,
  titleLetter,
} from "../utils/animations";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  fileName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  fileName,
}) => {
  const letters = title.split("");

  return (
    <motion.div
      className="mb-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {/* Filename */}
      <motion.p
        className="text-md font-mono text-zinc-600"
        variants={fadeUpDelayed}
      >
        [{fileName}.tsx]
      </motion.p>

      {/* Title */}
      <motion.h2
        className="text-4xl font-extrabold text-zinc-200 sm:text-7xl"
        variants={titleContainer}
        aria-label={title}
      >
        {letters.map((char, index) => (
          <motion.span
            key={index}
            variants={titleLetter}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && <p className="mt-4 text-xl text-zinc-300">{subtitle}</p>}
    </motion.div>
  );
};

export default SectionHeader;
