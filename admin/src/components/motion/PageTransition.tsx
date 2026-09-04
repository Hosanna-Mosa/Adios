import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp } from "./variants";

type PageTransitionProps = HTMLMotionProps<"div">;

/**
 * Mounted once inside each layout shell's <main>, around {children}.
 * Exit animation is picked up by the AnimatePresence in AnimatedRoutes.tsx,
 * which wraps the whole routed subtree (this component included).
 */
export function PageTransition({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeInUp} {...props}>
      {children}
    </motion.div>
  );
}
