import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Hourglass, CheckCircle2, XCircle } from "lucide-react";

interface ScheduledOrdersStatsRowProps {
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

/** The "Awaiting Action / Accepted / Rejected" stat cards on ScheduledOrders. */
export function ScheduledOrdersStatsRow({ pendingCount, acceptedCount, rejectedCount }: ScheduledOrdersStatsRowProps) {
  return (
    <StaggerList className="grid grid-cols-3 gap-4">
      <StaggerItem>
        <StatCard
          icon={<Hourglass className="h-5 w-5" />}
          label="Awaiting Action"
          value={pendingCount.toString()}
          badge="Needs a decision"
          badgeColor="destructive"
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Accepted" value={acceptedCount.toString()} />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected" value={rejectedCount.toString()} badge="Customer notified" badgeColor="muted" />
      </StaggerItem>
    </StaggerList>
  );
}
