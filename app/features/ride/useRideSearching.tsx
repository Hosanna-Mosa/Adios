import { useRideSearchingInsets } from "./useRideSearchingInsets";
import { useRideSearchingCancelReasonVisible } from "./useRideSearchingCancelReasonVisible";
import { useRideSearchingFare } from "./useRideSearchingFare";
import { useRideSearchingShowTripDetails } from "./useRideSearchingShowTripDetails";
import { useRideSearchingKeepSearching } from "./useRideSearchingKeepSearching";

// State, data loading and handlers for app/ride-searching.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useRideSearching() {
  const { colors, styles, currentOrderId, setCurrentOrderId, setGlobalServiceType, setGlobalDriver, setGlobalStatus, mapRef, progressBarStyle, dotStyle, params, tripDetailsVisible, setTripDetailsVisible } = useRideSearchingInsets();
  const { cancelReasonVisible, setCancelReasonVisible, cancelConfirmVisible, setCancelConfirmVisible, selectedCancelReason, setSelectedCancelReason, onlineDrivers, pickupCoords, dropCoords } = useRideSearchingCancelReasonVisible(params);
  const { fare, pickupTitle, dropTitle, cancelUsesDrop, cancelLocationTitle, cancelLocationAddress, cancelLocationLabel, fitTripMarkers } = useRideSearchingFare(setCurrentOrderId, setGlobalServiceType, mapRef, params, selectedCancelReason, pickupCoords, dropCoords);
  const { showTripDetails, showCancelReasons, selectCancelReason, refresh, refreshing } = useRideSearchingShowTripDetails(currentOrderId, setGlobalDriver, setGlobalStatus, setTripDetailsVisible, setCancelReasonVisible, setCancelConfirmVisible, setSelectedCancelReason);
  const { keepSearching, cancelRide } = useRideSearchingKeepSearching(currentOrderId, setCurrentOrderId, params, setTripDetailsVisible, setCancelReasonVisible, setCancelConfirmVisible, fare);

  return {
  colors, styles, mapRef, progressBarStyle, dotStyle, params, tripDetailsVisible,
  setTripDetailsVisible, cancelReasonVisible, setCancelReasonVisible, cancelConfirmVisible,
  selectedCancelReason, onlineDrivers, pickupCoords, dropCoords, fare, pickupTitle, dropTitle,
  cancelUsesDrop, cancelLocationTitle, cancelLocationAddress, cancelLocationLabel, fitTripMarkers,
  showTripDetails, showCancelReasons, selectCancelReason, keepSearching, cancelRide, refresh, refreshing
  };
}

