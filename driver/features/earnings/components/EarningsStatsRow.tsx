import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { styles } from "../earnings.styles";

/** Online hours and distance covered, side by side. */
export function EarningsStatsRow({
  onlineHours,
  totalDistance,
}: {
  onlineHours: number;
  totalDistance: number | string;
}) {
  return (
    <Animated.View entering={fadeInUp(180)} style={styles.bottomStats}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{onlineHours.toFixed(1)}h</Text>
        <Text style={styles.statLabel}>Online Hours</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{totalDistance} km</Text>
        <Text style={styles.statLabel}>Total Distance</Text>
      </View>
    </Animated.View>
  );
}
