import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  BreakdownRow,
  BreakdownTotal,
  CompletedScroll,
  CompletionHeader,
  EarningsBreakdownPanel,
  StageActionButton,
} from "../order";
import { formatCurrency } from "@/utils/format";

export function RideCompletedStage() {
  const { t } = useTranslation();
  const { earnings, handleStatusTransition } = useActiveOrderCtx();
  const { baseFare, distanceVal, distanceFare, surgeBonus, customerTip, totalEarningsCalculated } =
    earnings;

  return (
    <CompletedScroll>
      <CompletionHeader
        title={t("jobs.rideCompleted")}
        subtitle={t("jobs.earningsAddedToWallet")}
      />

      <EarningsBreakdownPanel title={t("jobs.earningsBreakdown")}>
        <BreakdownRow label={t("jobs.basePayout")} value={formatCurrency(baseFare)} />
        <BreakdownRow
          label={<>{t("jobs.distanceFareKm", { value: distanceVal, defaultValue: "Distance Fare ({{value}} km)" })}</>}
          value={formatCurrency(distanceFare)}
        />
        <BreakdownRow label={t("jobs.surgeBonus")} value={formatCurrency(surgeBonus)} />
        <BreakdownRow label={t("jobs.tips")} value={formatCurrency(customerTip)} />
        <BreakdownTotal label={t("jobs.totalPayout")} value={formatCurrency(totalEarningsCalculated)} />
      </EarningsBreakdownPanel>

      <StageActionButton
        label={t("jobs.finishAndReturnToHome")}
        onPress={handleStatusTransition}
        style={{ marginVertical: 16 }}
      />
    </CompletedScroll>
  );
}
