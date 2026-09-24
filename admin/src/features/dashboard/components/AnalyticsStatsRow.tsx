import { useTranslation } from "react-i18next";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

/**
 * The 4-card stats row on Analytics. Not built on Dashboard's MetricsRow
 * (item #15): these cards use hardcoded display values with no icon and
 * percentage-change badges (+14.2%, -2.1%, ...), a different shape from
 * MetricsRow's icon+fixed-label cards bound to live DashboardStats
 * fields. Also worth noting as a pre-existing gap, not something this
 * refactor introduces: these values are hardcoded literals, not read from
 * the analyticsData query the page actually fetches -- preserved exactly,
 * not wired up to real data.
 */
export function AnalyticsStatsRow() {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-4 gap-4">
      <StaggerItem>
        <StatCard label={t("analytics.totalOrders")} value="12,842" badge="+14.2%" badgeColor="success" />
      </StaggerItem>
      <StaggerItem>
        <StatCard label={t("analytics.netRevenue")} value="₹482.5k" badge="+8.4%" badgeColor="success" />
      </StaggerItem>
      <StaggerItem>
        <StatCard label={t("analytics.avgDelivery")} value="34.2m" badge="-2.1%" badgeColor="destructive" />
      </StaggerItem>
      <StaggerItem>
        <StatCard label={t("dashboard.activeDrivers")} value="842" badge={t("analytics.capacityPercent", { defaultValue: "98% cap." })} badgeColor="success" />
      </StaggerItem>
    </StaggerList>
  );
}
