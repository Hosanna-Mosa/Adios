import { useTranslation } from "react-i18next";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { AnalyticsSummary } from "../analyticsTypes";

interface AnalyticsStatsRowProps {
  summary: AnalyticsSummary;
  rangeLabel: string;
}

/**
 * The 4-card stats row on Analytics, bound to the `summary` block that
 * /admin/analytics returns for the selected range (these used to be
 * hardcoded literals with invented percentage-change badges).
 */
export function AnalyticsStatsRow({ summary, rangeLabel }: AnalyticsStatsRowProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-4 gap-4">
      <StaggerItem>
        <StatCard label={t("analytics.totalOrders")} value={(summary.totalOrders ?? 0).toLocaleString()} badge={rangeLabel} badgeColor="muted" />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          label={t("analytics.netRevenue")}
          value={`₹${(summary.netRevenue ?? 0).toLocaleString()}`}
          badge={t("analytics.nCompleted", { count: summary.completedOrders ?? 0, defaultValue: "{{count}} completed" })}
          badgeColor="success"
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard label={t("analytics.avgDelivery")} value={summary.avgDeliveryMinutes ? `${summary.avgDeliveryMinutes}m` : "—"} badge={rangeLabel} badgeColor="muted" />
      </StaggerItem>
      <StaggerItem>
        <StatCard label={t("dashboard.activeDrivers")} value={(summary.activeDrivers ?? 0).toLocaleString()} badge={t("analytics.onlineNow")} badgeColor="success" />
      </StaggerItem>
    </StaggerList>
  );
}
