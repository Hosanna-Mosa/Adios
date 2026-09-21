import React from "react";

import { fadeInUp } from "@/motion/presets";
import { styles } from "../earnings.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** Online hours and distance covered, side by side. */
export function EarningsStatsRow({
  onlineHours,
  totalDistance,
}: {
  onlineHours: number;
  totalDistance: number | string;
}) {
  return (
    <AnimatedBox entering={fadeInUp(180)} style={styles.bottomStats}>
      <Box style={styles.statCard}>
        <AppText style={styles.statValue}>{onlineHours.toFixed(1)}h</AppText>
        <AppText style={styles.statLabel}>Online Hours</AppText>
      </Box>
      <Box style={styles.statCard}>
        <AppText style={styles.statValue}>{totalDistance} km</AppText>
        <AppText style={styles.statLabel}>Total Distance</AppText>
      </Box>
    </AnimatedBox>
  );
}
