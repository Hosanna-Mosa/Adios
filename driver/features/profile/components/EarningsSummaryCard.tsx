import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";
import { formatCurrency } from "@/utils/format";

/** Today's and this week's earnings, split by a divider. */
export function EarningsSummaryCard({ today, week }: { today: number | string; week: number | string }) {
  return (
    <View style={styles.earningsSummary}>
      <View style={styles.earningsItem}>
        <Feather name="dollar-sign" size={18} color={Colors.primary} />
        <Text style={styles.earningsItemLabel}>Today&apos;s Earnings</Text>
        <Text style={styles.earningsItemValue}>{formatCurrency(today, { decimals: false })}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.earningsItem}>
        <Feather name="calendar" size={18} color={Colors.primary} />
        <Text style={styles.earningsItemLabel}>This Week</Text>
        <Text style={styles.earningsItemValue}>{formatCurrency(week, { decimals: false })}</Text>
      </View>
    </View>
  );
}
