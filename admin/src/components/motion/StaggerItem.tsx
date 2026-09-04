import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp } from "./variants";

type StaggerItemProps = HTMLMotionProps<"div">;

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  return (
    <motion.div variants={fadeInUp} {...props}>
      {children}
    </motion.div>
  );
}
