import { motion, type HTMLMotionProps } from "framer-motion";
import { staggerContainer } from "./variants";

interface StaggerListProps extends HTMLMotionProps<"div"> {
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean;
}

export function StaggerList({ children, inView = false, ...props }: StaggerListProps) {
  const triggerProps = inView
    ? { whileInView: "visible", viewport: { once: true, margin: "-80px" } }
    : { animate: "visible" };

  return (
    <motion.div initial="hidden" variants={staggerContainer} {...triggerProps} {...props}>
      {children}
    </motion.div>
  );
}
