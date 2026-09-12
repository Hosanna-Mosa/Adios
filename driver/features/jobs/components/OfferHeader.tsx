import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "./IncomingOrderModal.styles";

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
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.title}>{title}</Text>
        {isReserved ? (
          <Text style={[styles.subtitle, { color: Colors.brand, fontWeight: "700" }]}>
            Scheduled: {scheduledFor}
          </Text>
        ) : (
          isHelper && <Text style={styles.subtitle}>Hours Book / Task Specialist</Text>
        )}
      </View>
      <Text style={styles.earnings}>₹{earnings}</Text>
    </View>
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
    <View style={styles.timerContainer}>
      <View style={styles.timerBarBg}>
        <Animated.View style={[styles.timerBar, barStyle]} />
      </View>
      <Text style={styles.timerText}>Decline auto-triggers in {secondsLeft} seconds</Text>
    </View>
  );
}
