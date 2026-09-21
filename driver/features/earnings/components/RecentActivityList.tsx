import React from "react";

import { fadeInUp, staggerListItem } from "@/motion/presets";
import { styles } from "../earnings.styles";
import { formatCurrency, formatRelativeTime } from "../utils/format";
import { TransactionItem } from "./TransactionItem";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export interface EarningsTransaction {
  id: string;
  icon: any;
  label: string;
  amount: number;
  createdAt: string;
}

/** Recent payouts and adjustments, newest first. */
export function RecentActivityList({ transactions }: { transactions: EarningsTransaction[] }) {
  return (
    <AnimatedBox entering={fadeInUp(120)} style={styles.sectionCard}>
      <AppText style={styles.sectionTitle}>Recent Activity</AppText>
      {transactions.length === 0 ? (
        <AppText style={styles.emptyText}>No completed earnings yet.</AppText>
      ) : (
        transactions.map((tx, idx) => (
          <AnimatedBox key={tx.id} entering={staggerListItem(idx)}>
            <TransactionItem
              icon={tx.icon}
              label={tx.label}
              amount={`${tx.amount >= 0 ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}`}
              time={formatRelativeTime(tx.createdAt)}
            />
          </AnimatedBox>
        ))
      )}
    </AnimatedBox>
  );
}
