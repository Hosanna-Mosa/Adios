import React from "react";

import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "./IncomingOrderModal.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** Job title, payout, and the sub-line that differs for scheduled and
 * helper offers. */
export function OfferHeader({
  title,
  earnings,
  isReserved,
  scheduledFor,
  isHelper,
}: {
  title: string;
  earnings: React.ReactNode;
  isReserved?: boolean;
  scheduledFor: string;
  isHelper: boolean;
}) {
  return (
    <Box style={styles.header}>
      <Box style={styles.headerCopy}>
        <AppText style={styles.title}>{title}</AppText>
        {isReserved ? (
          <AppText style={[styles.subtitle, { color: Colors.brand, fontWeight: "700" }]}>
            Scheduled: {scheduledFor}
          </AppText>
        ) : (
          isHelper && <AppText style={styles.subtitle}>Hours Book / Task Specialist</AppText>
        )}
      </Box>
      <AppText style={styles.earnings}>₹{earnings}</AppText>
    </Box>
  );
}

/** Bar that drains while the offer is live. */
export function OfferCountdown({
  secondsLeft,
  barStyle,
}: {
  secondsLeft: number;
  barStyle: StyleProp<ViewStyle>;
}) {
  return (
    <Box style={styles.timerContainer}>
      <Box style={styles.timerBarBg}>
        <AnimatedBox style={[styles.timerBar, barStyle]} />
      </Box>
      <AppText style={styles.timerText}>Decline auto-triggers in {secondsLeft} seconds</AppText>
    </Box>
  );
}
