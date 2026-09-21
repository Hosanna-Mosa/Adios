import React from "react";

import { styles } from "../active-order.styles";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <Box style={[styles.bottomCard, { height }]}>
      <Box style={styles.cardHeader}>
        <AppText style={styles.orderLabel}>Order ID: {orderId}</AppText>
      </Box>
      <ScrollBox
        style={styles.cardScroll}
        contentContainerStyle={[styles.cardScrollContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollBox>
    </Box>
  );
}
