import React from "react";

import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <AnimatedBox entering={fadeInUp(0)} style={styles.balanceCard}>
      <AppText style={styles.balanceLabel}>{t("earnings.thisWeeksBalance")}</AppText>
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
        {t("earnings.available")} {formatCurrency(availableBalance)}
        {bankLast4 ? ` ${t("earnings.toBankEnding", { value: bankLast4, defaultValue: "to bank ending {{value}}" })}` : ""}
      </AppText>
    </AnimatedBox>
  );
}
