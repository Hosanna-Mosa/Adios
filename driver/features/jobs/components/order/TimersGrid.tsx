import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { formatCurrency } from "@/utils/format";

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
    <View style={styles.timersGrid}>
      <View style={styles.timerBlock}>
        <Text style={styles.timerBlockLabel}>Prep Status</Text>
        <Text style={styles.timerBlockVal}>{prep}</Text>
      </View>
      <View style={styles.timerBlock}>
        <Text style={styles.timerBlockLabel}>Waiting Fee Earned</Text>
        <Text style={[styles.timerBlockVal, { color: Colors.success }]}>
          +{formatCurrency(waitingComp)}
        </Text>
      </View>
    </View>
  );
}
