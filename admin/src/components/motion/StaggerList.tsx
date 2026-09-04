import { motion, type HTMLMotionProps } from "framer-motion";
import { staggerContainer } from "./variants";

type StaggerListProps = HTMLMotionProps<"div">;

export function StaggerList({ children, ...props }: StaggerListProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} {...props}>
      {children}
    </motion.div>
  );
}
