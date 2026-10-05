/** Payout breakdown shown on the completion screens. */
export function computeEarnings(distance: string | undefined) {
  const distanceVal = parseFloat(distance || "4.2") || 4.2;
  const distanceFare = Math.round(distanceVal * 6);
  const baseFare = 40;
  const surgeBonus = 15;
  const peakBonus = 10;
  const rainBonus = 20;
  const customerTip = 20;

  return {
    distanceVal,
    distanceFare,
    baseFare,
    surgeBonus,
    peakBonus,
    rainBonus,
    customerTip,
    totalEarningsCalculated:
      baseFare + distanceFare + surgeBonus + peakBonus + rainBonus + customerTip,
  };
}
