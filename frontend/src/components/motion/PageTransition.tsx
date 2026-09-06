import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp } from "./variants";

type PageTransitionProps = HTMLMotionProps<"div">;

/**
 * Entrance (and, when nested directly under an AnimatePresence with a
 * matching `key`, exit) animation wrapper. Used two ways in this app:
 *  - inside `__root.tsx`'s Layout, wrapping <Outlet/>, as the *direct* child
 *    of an AnimatePresence keyed on location.pathname — Header/Footer stay
 *    mounted, only the routed content cross-fades.
 *  - standalone (no AnimatePresence) on pages with their own full-page
 *    chrome (PartnerOnboarding, RestaurantMenuFront) — entrance-only, since
 *    those pages fully unmount/mount on navigation anyway.
 */
export function PageTransition({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeInUp} {...props}>
      {children}
    </motion.div>
  );
}
