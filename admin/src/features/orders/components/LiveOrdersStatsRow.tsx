import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { RefreshCw, Timer, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LiveOrder } from "../liveOrdersTypes";

interface LiveOrdersStatsRowProps {
  orders: LiveOrder[];
  activeOrdersCount: number;
}

/** The "Total Orders / Active Operations / Live In-Transit" stat cards on LiveOrders. */
export function LiveOrdersStatsRow({ orders, activeOrdersCount }: LiveOrdersStatsRowProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-3 gap-4">
      <StaggerItem>
        <StatCard icon={<RefreshCw className="h-5 w-5" />} label={t("dashboard.totalOrders")} value={orders.length.toString()} badge={t("orders.overall")} badgeColor="success" />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<Timer className="h-5 w-5" />} label={t("orders.activeOperations")} value={activeOrdersCount.toString()} />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<Truck className="h-5 w-5" />} label={t("orders.liveInTransit")} value={orders.filter((o) => o.status === "PICKED_UP").length.toString()} />
      </StaggerItem>
    </StaggerList>
  );
}
