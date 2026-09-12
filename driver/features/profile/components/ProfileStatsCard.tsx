import React from "react";

import { fadeInUp } from "@/motion/presets";
import { styles } from "../profile-tab.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export interface ProfileTabStat {
  value: string;
  label: string;
}

/** Trips / Acceptance / Status, separated by hairlines. */
export function ProfileStatsCard({ stats }: { stats: ProfileTabStat[] }) {
  return (
    <AnimatedBox entering={fadeInUp(60)} style={styles.statsCard}>
      {stats.map((stat, idx) => (
        <React.Fragment key={stat.label}>
          {idx > 0 && <Box style={styles.statDivider} />}
          <Box style={styles.statCol}>
            <AppText style={styles.statValueBold}>{stat.value}</AppText>
            <AppText style={styles.statLabelMuted}>{stat.label}</AppText>
          </Box>
        </React.Fragment>
      ))}
    </AnimatedBox>
  );
}
