import { useFindingDriverInsets } from "./useFindingDriverInsets";
import { useFindingDriverShowCancelSheet } from "./useFindingDriverShowCancelSheet";
import { useFindingDriverRaiseFare } from "./useFindingDriverRaiseFare";

// State, data loading and handlers for app/finding-driver.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline. CANCEL_REASONS used to be a static
// re-export of useFindingDriver.shared's constant; it's now returned from
// useFindingDriverShowCancelSheet() instead, since its labels call t().

export function useFindingDriver() {
  const { insets, orderId, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops, onlineDrivers, setOnlineDrivers, orderSummary, spinStyle, foodStage, isRide } = useFindingDriverInsets();
  const { showCancelSheet, setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel, CANCEL_REASONS } = useFindingDriverShowCancelSheet(orderId, stops, setOnlineDrivers, orderSummary);

  const { showRaiseFare, raising, raiseFare } = useFindingDriverRaiseFare(orderId, orderSummary, foodStage);

  return {
  showRaiseFare, raising, raiseFare,
  insets, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops,
  onlineDrivers, orderSummary, spinStyle, showCancelSheet,
  setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel,
  CANCEL_REASONS, foodStage, isRide
  };
}

