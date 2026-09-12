import React from "react";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { BreakdownRow, BreakdownTotal, EarningsBreakdownPanel } from "../order";
import { formatCurrency } from "@/utils/format";

export function DeliveryEarningsBreakdown() {
  const { earnings, waitingComp } = useActiveOrderCtx();
  const {
    baseFare, distanceVal, distanceFare, surgeBonus, rainBonus, peakBonus,
    customerTip, totalEarningsCalculated,
  } = earnings;

  return (
    <EarningsBreakdownPanel title="EARNINGS BREAKDOWN">
      <BreakdownRow label="Base Fare" value={formatCurrency(baseFare)} />
      <BreakdownRow
        label={<>Distance Fare ({distanceVal} km)</>}
        value={formatCurrency(distanceFare)}
      />
      <BreakdownRow label="Surge Incentives" value={formatCurrency(surgeBonus)} />
      <BreakdownRow label="Rain Bonus / Weather Surge" value={formatCurrency(rainBonus)} />
      <BreakdownRow label="Peak Hour Bonus" value={formatCurrency(peakBonus)} />
      <BreakdownRow label="Wait Fee Compensation" value={formatCurrency(waitingComp)} />
      <BreakdownRow label="Customer Tip" value={formatCurrency(customerTip)} />
      <BreakdownTotal label="TOTAL PAYOUT" value={formatCurrency(totalEarningsCalculated)} />
    </EarningsBreakdownPanel>
  );
}
