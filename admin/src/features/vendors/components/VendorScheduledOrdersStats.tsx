import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

interface VendorScheduledOrdersStatsProps {
  total: number;
  pending: number;
  accepted: number;
}

/** The "Total Requests / Awaiting Action / Accepted" stat cards on VendorScheduledOrders. */
export function VendorScheduledOrdersStats({ total, pending, accepted }: VendorScheduledOrdersStatsProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StaggerItem className="bg-card border border-border p-6 rounded-3xl">
        <p className="text-sm text-muted-foreground">{t("vendorScheduledOrders.totalRequests")}</p>
        <h3 className="text-2xl font-bold mt-1">{total}</h3>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-6 rounded-3xl">
        <p className="text-sm text-muted-foreground">{t("vendorScheduledOrders.awaitingAction")}</p>
        <h3 className="text-2xl font-bold mt-1 text-amber-600">{pending}</h3>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-6 rounded-3xl">
        <p className="text-sm text-muted-foreground">{t("vendorScheduledOrders.accepted")}</p>
        <h3 className="text-2xl font-bold mt-1 text-emerald-600">{accepted}</h3>
      </StaggerItem>
    </StaggerList>
  );
}
