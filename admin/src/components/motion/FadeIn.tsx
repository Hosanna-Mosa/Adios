import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp, TRANSITION_DEFAULT } from "./variants";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function FadeIn({ delay = 0, transition, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ ...TRANSITION_DEFAULT, delay, ...transition }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
