import React from "react";

import Colors from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  ChecklistGroup,
  CompletedScroll,
  CompletionHeader,
  HighDemandZones,
  RatingStars,
  StageActionButton,
} from "../order";
import { DeliveryEarningsBreakdown } from "./DeliveryEarningsBreakdown";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";

const DEMAND_ZONES = [
  "Koramangala 5th Block (Surge 1.8x)",
  "Indiranagar 100 Feet Road (Surge 1.5x)",
];

export function DeliveryCompletedStage() {
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  return (
    <CompletedScroll>
      <CompletionHeader
        title="Delivery Completed!"
        subtitle="Earnings have been added to your wallet."
      />

      <DeliveryEarningsBreakdown />

      <Box style={styles.feedbackSection}>
        <ChecklistGroup title="RATE YOUR EXPERIENCE" />
        <RatingStars rating={verification.rating} onRate={verification.setRating} />
        <AppTextInput
          style={styles.feedbackInput}
          placeholder="Any operational issues? Write comments here..."
          placeholderTextColor={Colors.textMuted}
          multiline
          value={verification.feedback}
          onChangeText={verification.setFeedback}
        />
      </Box>

      <HighDemandZones title="HIGH DEMAND ZONES" zones={DEMAND_ZONES} />

      <StageActionButton
        label="Finish & Return to Home"
        onPress={handleStatusTransition}
        style={{ marginVertical: 16 }}
      />
    </CompletedScroll>
  );
}
