import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  CompletedScroll,
  CompletionHeader,
  StageActionButton,
} from "../order";
import { DeliveryEarningsBreakdown } from "./DeliveryEarningsBreakdown";

export function RideCompletedStage() {
  const { t } = useTranslation();
  const { handleStatusTransition } = useActiveOrderCtx();

  return (
    <CompletedScroll>
      <CompletionHeader
        title={t("jobs.rideCompleted")}
        subtitle={t("jobs.earningsAddedToWallet")}
      />

      <DeliveryEarningsBreakdown />

      <StageActionButton
        label={t("jobs.finishAndReturnToHome")}
        onPress={handleStatusTransition}
        style={{ marginVertical: 16 }}
      />
    </CompletedScroll>
  );
}
