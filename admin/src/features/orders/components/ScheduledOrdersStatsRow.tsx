import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Hourglass, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ScheduledOrdersStatsRowProps {
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

/** The "Awaiting Action / Accepted / Rejected" stat cards on ScheduledOrders. */
export function ScheduledOrdersStatsRow({ pendingCount, acceptedCount, rejectedCount }: ScheduledOrdersStatsRowProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-3 gap-4">
      <StaggerItem>
        <StatCard
          icon={<Hourglass className="h-5 w-5" />}
          label={t("orders.awaitingAction")}
          value={pendingCount.toString()}
          badge={t("orders.needsADecision")}
          badgeColor="destructive"
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label={t("orders.statusAccepted")} value={acceptedCount.toString()} />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<XCircle className="h-5 w-5" />} label={t("orders.statusRejected")} value={rejectedCount.toString()} badge={t("orders.customerNotified")} badgeColor="muted" />
      </StaggerItem>
    </StaggerList>
  );
}
