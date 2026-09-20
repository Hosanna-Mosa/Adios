import React from "react";

import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <Box style={styles.breakdownRow}>
      <AppText style={styles.breakdownLabel}>{label}</AppText>
      <AppText style={styles.breakdownVal}>{value}</AppText>
    </Box>
  );
}
