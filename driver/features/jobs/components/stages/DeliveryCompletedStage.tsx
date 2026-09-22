import React from "react";
import { useTranslation } from "react-i18next";

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

export function DeliveryCompletedStage() {
  const { t } = useTranslation();
  const { verification, handleStatusTransition } = useActiveOrderCtx();

  // Place names are proper nouns and stay untranslated; only "Surge" is.
  const demandZones = [
    t("jobs.surgeZoneKoramangala", { defaultValue: "Koramangala 5th Block (Surge 1.8x)" }),
    t("jobs.surgeZoneIndiranagar", { defaultValue: "Indiranagar 100 Feet Road (Surge 1.5x)" }),
  ];

  return (
    <CompletedScroll>
      <CompletionHeader
        title={t("jobs.deliveryCompleted")}
        subtitle={t("jobs.earningsAddedToWallet")}
      />

      <DeliveryEarningsBreakdown />

      <Box style={styles.feedbackSection}>
        <ChecklistGroup title={t("jobs.rateYourExperience")} />
        <RatingStars rating={verification.rating} onRate={verification.setRating} />
        <AppTextInput
          style={styles.feedbackInput}
          placeholder={t("jobs.anyOperationalIssuesWriteComments")}
          placeholderTextColor={Colors.textMuted}
          multiline
          value={verification.feedback}
          onChangeText={verification.setFeedback}
        />
      </Box>

      <HighDemandZones title={t("jobs.highDemandZones")} zones={demandZones} />

      <StageActionButton
        label={t("jobs.finishAndReturnToHome")}
        onPress={handleStatusTransition}
        style={{ marginVertical: 16 }}
      />
    </CompletedScroll>
  );
}
