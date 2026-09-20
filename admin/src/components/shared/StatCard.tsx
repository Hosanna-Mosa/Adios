import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: "success" | "destructive" | "primary" | "muted";
  subtitle?: string;
}

const badgeStyles = {
  success: "text-success",
  destructive: "text-destructive",
  primary: "text-primary",
  muted: "text-muted-foreground",
};

export function StatCard({ icon, label, value, badge, badgeColor = "success", subtitle }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="stat-card flex flex-col gap-3 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        {badge && (
          <span className={`text-xs font-semibold ${badgeStyles[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${badgeStyles[badgeColor]}`}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
