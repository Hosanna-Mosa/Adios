import type { ReactNode } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/FadeIn";
import type { ActivityLogItem } from "../types";

interface LiveActivityLogProps {
  activityLog: ActivityLogItem[];
  getActivityIcon: (type: string) => ReactNode;
}

/**
 * The "Live Activity Log" panel. The plan names this LiveOrderFeed, but
 * the actual panel mixes delivery/system/user-registration events, not
 * just orders -- named for what it is.
 */
export function LiveActivityLog({ activityLog, getActivityIcon }: LiveActivityLogProps) {
  return (
    <FadeIn delay={0.05} className="section-card p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">Live Activity Log</h3>
      <div className="flex-1 space-y-4">
        {activityLog.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">{getActivityIcon(item.type)}</div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => toast.info("Audit log is fully up to date. No older activities to display.")}
        className="mt-4 w-full py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        View All Activity
      </button>
    </FadeIn>
  );
}
