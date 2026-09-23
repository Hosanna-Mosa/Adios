import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { DollarSign, Truck, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentsStatsRowProps {
  totalEarned: number;
}

/** The "Total Earnings / Delivery Charges / Driver Payouts" stat cards on Payments. */
export function PaymentsStatsRow({ totalEarned }: PaymentsStatsRowProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-3 gap-4">
      <StaggerItem><StatCard icon={<DollarSign className="h-5 w-5" />} label={t("orders.totalEarnings")} value={`₹${totalEarned.toLocaleString()}`} badge={t("orders.monthly")} badgeColor="primary" subtitle={t("orders.upFromLastMonth", { pct: "12.4", defaultValue: "+{{pct}}% from last month" })} /></StaggerItem>
      <StaggerItem><StatCard icon={<Truck className="h-5 w-5" />} label={t("orders.deliveryCharges")} value={`₹${(totalEarned * 0.35).toFixed(2)}`} subtitle={t("orders.updatedMinsAgo", { count: 5, defaultValue: "Updated {{count}} mins ago" })} badgeColor="primary" /></StaggerItem>
      <StaggerItem><StatCard icon={<CreditCard className="h-5 w-5" />} label={t("orders.driverPayouts")} value={`₹${(totalEarned * 0.65).toFixed(2)}`} subtitle={t("orders.payoutSuccessRate", { pct: "98.2", defaultValue: "{{pct}}% Payout Success Rate" })} badgeColor="success" /></StaggerItem>
    </StaggerList>
  );
}
