import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { BreakdownRow, BreakdownTotal, EarningsBreakdownPanel } from "../order";
import { formatCurrency } from "@/utils/format";

export function DeliveryEarningsBreakdown() {
  const { t } = useTranslation();
  const { earnings } = useActiveOrderCtx();
  const {
    baseFare, distanceVal, distanceFare, surgeBonus, rainBonus, peakBonus,
    customerTip, totalEarningsCalculated,
  } = earnings;

  return (
    <EarningsBreakdownPanel title={t("jobs.earningsBreakdown")}>
      <BreakdownRow label={t("jobs.baseFare")} value={formatCurrency(baseFare)} />
      <BreakdownRow
        label={<>{t("jobs.distanceFareKm", { value: distanceVal, defaultValue: "Distance Fare ({{value}} km)" })}</>}
        value={formatCurrency(distanceFare)}
      />
      <BreakdownRow label={t("jobs.surgeIncentives")} value={formatCurrency(surgeBonus)} />
      <BreakdownRow label={t("jobs.rainBonusWeatherSurge")} value={formatCurrency(rainBonus)} />
      <BreakdownRow label={t("jobs.peakHourBonus")} value={formatCurrency(peakBonus)} />
      <BreakdownRow label={t("jobs.customerTip")} value={formatCurrency(customerTip)} />
      <BreakdownTotal label={t("jobs.totalPayout")} value={formatCurrency(totalEarningsCalculated)} />
    </EarningsBreakdownPanel>
  );
}
