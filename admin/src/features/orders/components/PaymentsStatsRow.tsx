import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { DollarSign, Truck, CreditCard } from "lucide-react";

interface PaymentsStatsRowProps {
  totalEarned: number;
}

/** The "Total Earnings / Delivery Charges / Driver Payouts" stat cards on Payments. */
export function PaymentsStatsRow({ totalEarned }: PaymentsStatsRowProps) {
  return (
    <StaggerList className="grid grid-cols-3 gap-4">
      <StaggerItem><StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Earnings" value={`₹${totalEarned.toLocaleString()}`} badge="MONTHLY" badgeColor="primary" subtitle="+12.4% from last month" /></StaggerItem>
      <StaggerItem><StatCard icon={<Truck className="h-5 w-5" />} label="Delivery Charges" value={`₹${(totalEarned * 0.35).toFixed(2)}`} subtitle="Updated 5 mins ago" badgeColor="primary" /></StaggerItem>
      <StaggerItem><StatCard icon={<CreditCard className="h-5 w-5" />} label="Driver Payouts" value={`₹${(totalEarned * 0.65).toFixed(2)}`} subtitle="98.2% Payout Success Rate" badgeColor="success" /></StaggerItem>
    </StaggerList>
  );
}
