import React from "react";
import { ScrollView, Text, View } from "react-native";
import { styles } from "../active-order.styles";

/** Bottom sheet carrying the job's details. It grows for the stages that
 * have more to show — item checklists, payout breakdowns, ratings. */
export function OrderDetailSheet({
  orderId,
  height,
  paddingBottom,
  children,
}: {
  orderId: string;
  height: number;
  paddingBottom: number;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.bottomCard, { height }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderLabel}>Order ID: {orderId}</Text>
      </View>
      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={[styles.cardScrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
