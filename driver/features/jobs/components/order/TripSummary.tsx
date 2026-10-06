import React from "react";
import { StyleSheet } from "react-native";

import { Colors, radius } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/**
 * A ride's pickup → drop at a glance, with the trip's distance and time. The
 * green dot and red square match the map's Pickup / Drop bubbles; the stop the
 * driver is heading to now is the bold one.
 */
export function TripSummary({
  pickup,
  drop,
  distance,
  duration,
  heading,
}: {
  pickup?: string;
  drop?: string;
  distance?: string;
  duration?: string;
  heading: "pickup" | "drop";
}) {
  const meta = [distance, duration].filter(Boolean).join(" · ");
  return (
    <Box style={styles.card}>
      <Box style={styles.row}>
        <Box style={[styles.dot, { backgroundColor: Colors.success }]} />
        <AppText style={[styles.address, heading === "pickup" && styles.current]} numberOfLines={1}>
          {pickup || "—"}
        </AppText>
      </Box>
      <Box style={styles.rail} />
      <Box style={styles.row}>
        <Box style={[styles.square, { backgroundColor: Colors.error }]} />
        <AppText style={[styles.address, heading === "drop" && styles.current]} numberOfLines={1}>
          {drop || "—"}
        </AppText>
      </Box>
      {meta ? <AppText style={styles.meta}>{meta}</AppText> : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  square: { width: 10, height: 10, borderRadius: 2 },
  rail: { width: 2, height: 12, marginLeft: 4, marginVertical: 3, backgroundColor: Colors.border },
  address: { flex: 1, fontSize: typography.sizes.medium, color: Colors.textSecondary },
  current: { color: Colors.text, fontWeight: "700" },
  meta: { marginTop: 10, fontSize: typography.sizes.small, fontWeight: "600", color: Colors.textSecondary },
});
