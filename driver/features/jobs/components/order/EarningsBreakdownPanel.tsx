import React from "react";

import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Titled panel wrapping the payout rows on a completed job. */
export function EarningsBreakdownPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box style={styles.earningsBreakdown}>
      <AppText style={styles.breakdownHeader}>{title}</AppText>
      {children}
    </Box>
  );
}
