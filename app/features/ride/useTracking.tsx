import { useTrackingStatus } from "./useTrackingStatus";
import { useTrackingOrderCreatedAt } from "./useTrackingOrderCreatedAt";
import { useTrackingHandleShareTrip } from "./useTrackingHandleShareTrip";
import { useTrackingPickupStop } from "./useTrackingPickupStop";
import { useTrackingHandleBack } from "./useTrackingHandleBack";
export { STATUS_ORDER } from "./useTracking.shared";
export { TimelineStep } from "./useTracking.shared";

// State, data loading and handlers for app/tracking.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useTracking() {
  const { status, setStatus, currentOrderId, setOrderId, setServiceType, route, setRoute, stops, setStops, driver, setDriver, unreadCount, resetDelivery, insets, params, tokens, isRide, isHelper, vendorName, setVendorName, setVendorPartnerType, accent, styles, eta, setEta } = useTrackingStatus();
  const { orderCreatedAt, setOrderCreatedAt, deliveredAt, setDeliveredAt, tripModalVisible, setTripModalVisible, helperStatus, setHelperStatus, deliveryOtp, setDeliveryOtp, startOtp, setStartOtp, isPackageDelivery, setIsPackageDelivery, driverLocation, setDriverLocation, radius, setRadius, totalPrice, setTotalPrice, mapRef, cancellationAlerted, handleOrderCancelledByDriver, handleSOS } = useTrackingOrderCreatedAt(currentOrderId, resetDelivery);
  const { handleShareTrip, deliveryStop } = useTrackingHandleShareTrip(status, currentOrderId, setOrderId, stops, driver, params, isRide, cancellationAlerted, handleOrderCancelledByDriver);
  const { pickupStop, refresh, refreshing } = useTrackingPickupStop(setStatus, currentOrderId, setServiceType, setRoute, stops, setStops, setDriver, setVendorName, setVendorPartnerType, setEta, setOrderCreatedAt, setDeliveredAt, setDeliveryOtp, setStartOtp, setDriverLocation, setRadius, setTotalPrice, handleOrderCancelledByDriver, setHelperStatus, setIsPackageDelivery);
  const { handleBack, userLocCoords, bannerText } = useTrackingHandleBack(status, currentOrderId, stops, isRide, isHelper, eta, setEta, driverLocation, deliveryStop, pickupStop);

  return {
  status, currentOrderId, route, stops, driver, unreadCount, insets, tokens, isRide, isHelper,
  vendorName, accent, styles, eta, orderCreatedAt, deliveredAt, tripModalVisible,
  setTripModalVisible, helperStatus, deliveryOtp, startOtp, isPackageDelivery, driverLocation, radius, totalPrice,
  mapRef, handleSOS, handleShareTrip, deliveryStop, pickupStop,
  handleBack, userLocCoords, bannerText, refresh, refreshing
  };
}

