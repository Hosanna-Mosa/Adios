import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";
import { formatCurrency } from "@/utils/format";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Today's and this week's earnings, split by a divider. */
export function EarningsSummaryCard({ today, week }: { today: number | string; week: number | string }) {
  const { t } = useTranslation();
  return (
    <Box style={styles.earningsSummary}>
      <Box style={styles.earningsItem}>
        <Feather name="dollar-sign" size={18} color={Colors.primary} />
        <AppText style={styles.earningsItemLabel}>{t("profile.todaysEarnings")}</AppText>
        <AppText style={styles.earningsItemValue}>{formatCurrency(today, { decimals: false })}</AppText>
      </Box>
      <Box style={styles.divider} />
      <Box style={styles.earningsItem}>
        <Feather name="calendar" size={18} color={Colors.primary} />
        <AppText style={styles.earningsItemLabel}>{t("earnings.thisWeek")}</AppText>
        <AppText style={styles.earningsItemValue}>{formatCurrency(week, { decimals: false })}</AppText>
      </Box>
    </Box>
  );
}
