import type { Transition, Variants } from "framer-motion";

export const TRANSITION_DEFAULT: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

export const TRANSITION_FAST: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITION_DEFAULT },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: TRANSITION_DEFAULT },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: TRANSITION_FAST },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};
