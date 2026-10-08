import React from "react";
import { useTranslation } from "react-i18next";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { BreakdownRow, BreakdownTotal, EarningsBreakdownPanel } from "../order";
import { formatCurrency } from "@/utils/format";

/** The payout on a finished delivery or ride: only what the order really carries
 * (see orderPayout), never made-up fare lines or bonuses. */
export function DeliveryEarningsBreakdown() {
  const { t } = useTranslation();
  const { earnings } = useActiveOrderCtx();

  return (
    <EarningsBreakdownPanel title={t("jobs.earningsBreakdown")}>
      {earnings.distance ? (
        <BreakdownRow label={t("jobs.distance")} value={earnings.distance} />
      ) : null}
      <BreakdownTotal label={t("jobs.totalPayout")} value={formatCurrency(earnings.total)} />
    </EarningsBreakdownPanel>
  );
}
