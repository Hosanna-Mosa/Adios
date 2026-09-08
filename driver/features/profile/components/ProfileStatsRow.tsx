import React from "react";
import { Text, View } from "react-native";
import { styles } from "../profile.styles";

export interface ProfileStat {
  value: string | number;
  label: string;
}

/** Row of headline driver stats. */
export function ProfileStatsRow({ stats }: { stats: ProfileStat[] }) {
  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.statCard}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}
