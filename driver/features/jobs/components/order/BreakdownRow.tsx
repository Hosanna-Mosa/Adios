import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../active-order.styles";

/** One label/amount line in an earnings or payout breakdown.
 * Written out eleven times across the ride and delivery summaries. */
export function BreakdownRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownVal}>{value}</Text>
    </View>
  );
}
