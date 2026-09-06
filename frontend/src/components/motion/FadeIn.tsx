import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp, TRANSITION_DEFAULT } from "./variants";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  /** Animate when scrolled into view instead of on mount — for below-the-fold
   *  sections on long pages, so they don't all animate at once on page load. */
  inView?: boolean;
}

export function FadeIn({ delay = 0, transition, children, inView = false, ...props }: FadeInProps) {
  const triggerProps = inView
    ? { whileInView: "visible", viewport: { once: true, margin: "-80px" } }
    : { animate: "visible" };

  return (
    <motion.div
      initial="hidden"
      variants={fadeInUp}
      transition={{ ...TRANSITION_DEFAULT, delay, ...transition }}
      {...triggerProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}
