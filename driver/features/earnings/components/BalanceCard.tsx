import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import { styles } from "../earnings.styles";
import { formatCurrency } from "../utils/format";

/** This week's balance with its trend badge and the payable amount. */
export function BalanceCard({
  weekBalance,
  availableBalance,
  trendPercent,
  trendLabel,
  bankLast4,
}: {
  weekBalance: number;
  availableBalance: number;
  trendPercent: number;
  trendLabel: string;
  bankLast4?: string | null;
}) {
  return (
    <Animated.View entering={fadeInUp(0)} style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>This Week&apos;s Balance</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceAmount}>{formatCurrency(weekBalance)}</Text>
        <View style={styles.trendBadge}>
          <Feather
            name={trendPercent >= 0 ? "arrow-up" : "arrow-down"}
            size={12}
            color={Colors.success}
          />
          <Text style={styles.trendText}>{trendLabel}</Text>
        </View>
      </View>
      <Text style={styles.availableText}>
        Available: {formatCurrency(availableBalance)}
        {bankLast4 ? ` to bank ending ${bankLast4}` : ""}
      </Text>
    </Animated.View>
  );
}
