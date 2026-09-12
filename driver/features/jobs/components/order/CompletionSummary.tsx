import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Tick, headline and reassurance shown when a job is finished. */
export function CompletionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box style={styles.successHeader}>
      <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
      <AppText style={styles.successTitle}>{title}</AppText>
      <AppText style={styles.successSubtitle}>{subtitle}</AppText>
    </Box>
  );
}

/** Emphasised final line under an earnings breakdown. */
export function BreakdownTotal({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box style={styles.breakdownTotalRow}>
      <AppText style={styles.breakdownTotalLabel}>{label}</AppText>
      <AppText style={styles.breakdownTotalVal}>{value}</AppText>
    </Box>
  );
}

/** Five-star rating row. */
export function RatingStars({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (star: number) => void;
}) {
  return (
    <Box style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Touchable key={star} onPress={() => onRate(star)}>
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={28}
            color={Colors.warning}
            style={{ marginHorizontal: 4 }}
          />
        </Touchable>
      ))}
    </Box>
  );
}
