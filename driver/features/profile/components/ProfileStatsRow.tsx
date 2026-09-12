import React from "react";

import { styles } from "../profile.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export interface ProfileStat {
  value: string | number;
  label: string;
}

/** Row of headline driver stats. */
export function ProfileStatsRow({ stats }: { stats: ProfileStat[] }) {
  return (
    <Box style={styles.statsRow}>
      {stats.map((stat) => (
        <Box key={stat.label} style={styles.statCard}>
          <AppText style={styles.statValue}>{stat.value}</AppText>
          <AppText style={styles.statLabel}>{stat.label}</AppText>
        </Box>
      ))}
    </Box>
  );
}
