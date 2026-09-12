import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../active-order.styles";

/** Titled panel wrapping the payout rows on a completed job. */
export function EarningsBreakdownPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.earningsBreakdown}>
      <Text style={styles.breakdownHeader}>{title}</Text>
      {children}
    </View>
  );
}
