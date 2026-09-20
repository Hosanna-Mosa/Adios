import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { declineStyles as styles } from "./DeclineReasonList.styles";
import { typography } from "@/constants/typography";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

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
    <Box style={styles.wrap}>
      <AppText style={styles.heading}>Why are you declining?</AppText>
      {REASONS.map((reason, idx) => (
        <AnimatedBox key={reason} entering={staggerListItem(idx)}>
          <Touchable style={styles.row} onPress={() => onDecline(reason)}>
            <AppText style={styles.rowText}>{reason}</AppText>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Touchable>
        </AnimatedBox>
      ))}
      <Touchable style={styles.back} onPress={onBack}>
        <AppText style={{ fontSize: typography.sizes.large, fontWeight: "700", color: Colors.textSecondary }}>
          Back to Order
        </AppText>
      </Touchable>
    </Box>
  );
}
