import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import type { ActivityLogItem } from "../types";

interface LiveActivityLogProps {
  activityLog: ActivityLogItem[];
  isLoading?: boolean;
  getActivityIcon: (type: string) => ReactNode;
}

/** "2m ago" from a real timestamp — the activity rows used to carry a
 *  hardcoded "Just now" regardless of when the thing actually happened. */
function timeAgo(value: string | null | undefined, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return t("notifications.justNow");
  if (mins < 60) return t("notifications.minutesAgo", { count: mins, defaultValue: "{{count}}m ago" });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("notifications.hoursAgo", { count: hrs, defaultValue: "{{count}}h ago" });
  const days = Math.floor(hrs / 24);
  return t("notifications.daysAgo", { count: days, defaultValue: "{{count}}d ago" });
}

/**
 * The "Live Activity Log" panel. The plan names this LiveOrderFeed, but
 * the actual panel mixes delivery/system/user-registration events, not
 * just orders -- named for what it is.
 */
export function LiveActivityLog({ activityLog, isLoading = false, getActivityIcon }: LiveActivityLogProps) {
  const { t } = useTranslation();
  return (
    <FadeIn delay={0.05} className="section-card p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.liveActivityLog")}</h3>
      <div className="flex-1 space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">{t("dashboard.loadingActivity")}</p>}
        {!isLoading && activityLog.length === 0 && <p className="text-sm text-muted-foreground">{t("dashboard.noActivityYet")}</p>}
        {activityLog.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">{getActivityIcon(item.type)}</div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{[item.desc, timeAgo(item.time, t)].filter(Boolean).join(" • ")}</p>
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
