import React from "react";

import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { formatCurrency } from "@/utils/format";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Prep countdown and the waiting compensation earned while at the restaurant. */
export function TimersGrid({
  prepTimeRemaining,
  waitingComp,
}: {
  prepTimeRemaining: number;
  waitingComp: number;
}) {
  const prep =
    prepTimeRemaining > 0
      ? `${Math.floor(prepTimeRemaining / 60)}:${(prepTimeRemaining % 60).toString().padStart(2, "0")}`
      : "Food Ready";

  return (
    <Box style={styles.timersGrid}>
      <Box style={styles.timerBlock}>
        <AppText style={styles.timerBlockLabel}>Prep Status</AppText>
        <AppText style={styles.timerBlockVal}>{prep}</AppText>
      </Box>
      <Box style={styles.timerBlock}>
        <AppText style={styles.timerBlockLabel}>Waiting Fee Earned</AppText>
        <AppText style={[styles.timerBlockVal, { color: Colors.success }]}>
          +{formatCurrency(waitingComp)}
        </AppText>
      </Box>
    </Box>
  );
}
