import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { DollarSign, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaymentsStatsRowProps {
  totalEarned: number;
  transactionCount: number;
  driverPayoutsTotal: number;
  paidDriverPayoutsCount: number;
}

/**
 * The "Total Earnings / Driver Payouts" stat cards on Payments, both summed
 * from real rows. A "Delivery Charges" card (a fixed 35% of earnings) and the
 * invented "+12.4% from last month" / "Updated 5 mins ago" / "98.2% Payout
 * Success Rate" captions were removed: nothing the page fetches backs them.
 */
export function PaymentsStatsRow({ totalEarned, transactionCount, driverPayoutsTotal, paidDriverPayoutsCount }: PaymentsStatsRowProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-2 gap-4">
      <StaggerItem><StatCard icon={<DollarSign className="h-5 w-5" />} label={t("orders.totalEarnings")} value={`₹${totalEarned.toLocaleString()}`} subtitle={t("orders.nTransactions", { count: transactionCount, defaultValue: "{{count}} transactions" })} badgeColor="muted" /></StaggerItem>
      <StaggerItem><StatCard icon={<CreditCard className="h-5 w-5" />} label={t("orders.driverPayouts")} value={`₹${driverPayoutsTotal.toLocaleString()}`} subtitle={t("orders.nPayoutsPaid", { count: paidDriverPayoutsCount, defaultValue: "{{count}} payouts paid" })} badgeColor="muted" /></StaggerItem>
    </StaggerList>
  );
}
