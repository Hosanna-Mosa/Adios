import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import { styles } from "../earnings.styles";
import { formatCurrency } from "../utils/format";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

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
    <AnimatedBox entering={fadeInUp(0)} style={styles.balanceCard}>
      <AppText style={styles.balanceLabel}>This Week&apos;s Balance</AppText>
      <Box style={styles.balanceRow}>
        <AppText style={styles.balanceAmount}>{formatCurrency(weekBalance)}</AppText>
        <Box style={styles.trendBadge}>
          <Feather
            name={trendPercent >= 0 ? "arrow-up" : "arrow-down"}
            size={12}
            color={Colors.success}
          />
          <AppText style={styles.trendText}>{trendLabel}</AppText>
        </Box>
      </Box>
      <AppText style={styles.availableText}>
        Available: {formatCurrency(availableBalance)}
        {bankLast4 ? ` to bank ending ${bankLast4}` : ""}
      </AppText>
    </AnimatedBox>
  );
}
