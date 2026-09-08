import React from "react";
import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { styles } from "../earnings.styles";
import { formatCurrency, formatRelativeTime } from "../utils/format";
import { TransactionItem } from "./TransactionItem";

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
    <Animated.View entering={fadeInUp(120)} style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>No completed earnings yet.</Text>
      ) : (
        transactions.map((tx, idx) => (
          <Animated.View key={tx.id} entering={staggerListItem(idx)}>
            <TransactionItem
              icon={tx.icon}
              label={tx.label}
              amount={`${tx.amount >= 0 ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}`}
              time={formatRelativeTime(tx.createdAt)}
            />
          </Animated.View>
        ))
      )}
    </Animated.View>
  );
}
