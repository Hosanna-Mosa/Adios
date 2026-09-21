import React from "react";

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
  const { earnings, handleStatusTransition } = useActiveOrderCtx();
  const { baseFare, distanceVal, distanceFare, surgeBonus, customerTip, totalEarningsCalculated } =
    earnings;

  return (
    <CompletedScroll>
      <CompletionHeader
        title="Ride Completed!"
        subtitle="Earnings have been added to your wallet."
      />

      <EarningsBreakdownPanel title="EARNINGS BREAKDOWN">
        <BreakdownRow label="Base Payout" value={formatCurrency(baseFare)} />
        <BreakdownRow
          label={<>Distance Fare ({distanceVal} km)</>}
          value={formatCurrency(distanceFare)}
        />
        <BreakdownRow label="Surge Bonus" value={formatCurrency(surgeBonus)} />
        <BreakdownRow label="Tips" value={formatCurrency(customerTip)} />
        <BreakdownTotal label="TOTAL PAYOUT" value={formatCurrency(totalEarningsCalculated)} />
      </EarningsBreakdownPanel>

      <StageActionButton
        label="Finish & Return to Home"
        onPress={handleStatusTransition}
        style={{ marginVertical: 16 }}
      />
    </CompletedScroll>
  );
}
