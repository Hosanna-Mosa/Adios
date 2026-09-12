import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { declineStyles as styles } from "./DeclineReasonList.styles";
import { typography } from "@/constants/typography";

const REASONS = [
  "Fare is too low",
  "Distance is too long",
  "Pickup is too far",
  "Not interested right now",
];

/** Why the driver is turning an offer down. */
export function DeclineReasonList({
  onDecline,
  onBack,
}: {
  onDecline: (reason: string) => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Why are you declining?</Text>
      {REASONS.map((reason, idx) => (
        <Animated.View key={reason} entering={staggerListItem(idx)}>
          <TouchableOpacity style={styles.row} onPress={() => onDecline(reason)}>
            <Text style={styles.rowText}>{reason}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      ))}
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={{ fontSize: typography.sizes.large, fontWeight: "700", color: Colors.textSecondary }}>
          Back to Order
        </Text>
      </TouchableOpacity>
    </View>
  );
}
