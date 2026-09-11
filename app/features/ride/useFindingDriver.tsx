import { useFindingDriverInsets } from "./useFindingDriverInsets";
import { useFindingDriverShowCancelSheet } from "./useFindingDriverShowCancelSheet";
export { CANCEL_REASONS } from "./useFindingDriver.shared";

// State, data loading and handlers for app/finding-driver.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useFindingDriver() {
  const { insets, orderId, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops, onlineDrivers, setOnlineDrivers, orderSummary, ring1Style, ring2Style, spinStyle } = useFindingDriverInsets();
  const { showCancelSheet, setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel } = useFindingDriverShowCancelSheet(orderId, stops, setOnlineDrivers, orderSummary);

  return {
  insets, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops,
  onlineDrivers, orderSummary, ring1Style, ring2Style, spinStyle, showCancelSheet,
  setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel
  };
}

