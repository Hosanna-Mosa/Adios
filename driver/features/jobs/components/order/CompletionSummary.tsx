import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";

/** Tick, headline and reassurance shown when a job is finished. */
export function CompletionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.successHeader}>
      <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
      <Text style={styles.successTitle}>{title}</Text>
      <Text style={styles.successSubtitle}>{subtitle}</Text>
    </View>
  );
}

/** Emphasised final line under an earnings breakdown. */
export function BreakdownTotal({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.breakdownTotalRow}>
      <Text style={styles.breakdownTotalLabel}>{label}</Text>
      <Text style={styles.breakdownTotalVal}>{value}</Text>
    </View>
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
    <View style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={28}
            color={Colors.warning}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
