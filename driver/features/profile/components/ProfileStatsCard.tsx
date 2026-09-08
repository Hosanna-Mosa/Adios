import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { styles } from "../profile-tab.styles";

export interface ProfileTabStat {
  value: string;
  label: string;
}

/** Trips / Acceptance / Status, separated by hairlines. */
export function ProfileStatsCard({ stats }: { stats: ProfileTabStat[] }) {
  return (
    <Animated.View entering={fadeInUp(60)} style={styles.statsCard}>
      {stats.map((stat, idx) => (
        <React.Fragment key={stat.label}>
          {idx > 0 && <View style={styles.statDivider} />}
          <View style={styles.statCol}>
            <Text style={styles.statValueBold}>{stat.value}</Text>
            <Text style={styles.statLabelMuted}>{stat.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </Animated.View>
  );
}
