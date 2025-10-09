import { easeInOut, easeOut } from "framer-motion";

export const fade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, easeOut },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, easeOut },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { easeOut, duration: 0.5 },
  },
};

export const fadeUpDelayed = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { easeOut, duration: 0.5, delay: 0.3 },
  },
};

export const fadeDownDelayed = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { easeOut, duration: 0.5, delay: 0.5 },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { easeOut, duration: 0.5 },
  },
};

export const titleContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

export const titleLetter = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { easeOut, duration: 0.5 },
  },
};

export const scrollLetterJump = {
  hidden: {
    opacity: 1,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: [0, -10, 0],
    transition: {
      easeInOut,
      duration: 0.3,
    },
  },
};
