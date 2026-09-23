import { Package, Truck, Users, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { DashboardStats } from "../types";

interface MetricsRowProps {
  stats: DashboardStats | undefined;
}

/** The 4-card top stats row on Dashboard, built directly on the shared StatCard. */
export function MetricsRow({ stats }: MetricsRowProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-4 gap-4">
      <StaggerItem>
        <StatCard icon={<Package className="h-5 w-5" />} label={t("dashboard.totalOrders")} value={stats?.totalOrders?.toString() || "0"} badge={t("dashboard.allTime")} badgeColor="success" />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<Truck className="h-5 w-5" />} label={t("dashboard.activeDrivers")} value={stats?.activeDrivers?.toString() || "0"} badge={t("dashboard.online")} badgeColor="success" />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<Users className="h-5 w-5" />} label={t("dashboard.totalUsers")} value={stats?.totalUsers?.toString() || "0"} badge={t("dashboard.system")} badgeColor="muted" />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<DollarSign className="h-5 w-5" />} label={t("dashboard.totalRevenue")} value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`} badge="INR" badgeColor="success" />
      </StaggerItem>
    </StaggerList>
  );
}
