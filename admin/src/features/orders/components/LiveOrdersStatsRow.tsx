import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { RefreshCw, Timer, Truck } from "lucide-react";
import type { LiveOrder } from "../liveOrdersTypes";

interface LiveOrdersStatsRowProps {
  orders: LiveOrder[];
  activeOrdersCount: number;
}

/** The "Total Orders / Active Operations / Live In-Transit" stat cards on LiveOrders. */
export function LiveOrdersStatsRow({ orders, activeOrdersCount }: LiveOrdersStatsRowProps) {
  return (
    <StaggerList className="grid grid-cols-3 gap-4">
      <StaggerItem>
        <StatCard icon={<RefreshCw className="h-5 w-5" />} label="Total Orders" value={orders.length.toString()} badge="Overall" badgeColor="success" />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<Timer className="h-5 w-5" />} label="Active Operations" value={activeOrdersCount.toString()} />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<Truck className="h-5 w-5" />} label="Live In-Transit" value={orders.filter((o) => o.status === "PICKED_UP").length.toString()} />
      </StaggerItem>
    </StaggerList>
  );
}
