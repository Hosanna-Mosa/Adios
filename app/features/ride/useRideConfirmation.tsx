import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRideConfirmationInsets } from "./useRideConfirmationInsets";
import { useRideConfirmationValidStops } from "./useRideConfirmationValidStops";
import { useRideConfirmationPart3 } from "./useRideConfirmationPart3";
import { useRideConfirmationGetDisplayName } from "./useRideConfirmationGetDisplayName";
import { useRideConfirmationPlaceOrder } from "./useRideConfirmationPlaceOrder";
import { getEnabledTiers } from "./useRideConfirmation.shared";

// State, data loading and handlers for app/ride-confirmation.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

// keeps Cab Economy/Prime commented out — a pre-existing decision, not one
// made during this redesign), so those are the only two tiers this screen
// can honestly compare fares for.

export function useRideConfirmation() {
  const { insets, params, tokens, accent, styles, selectedTier, setSelectedTier, tierFares, loadingFares, booking, setBooking, showDatePicker, setShowDatePicker, reserveDate, setReserveDate, reserveHour, setReserveHour, reserveMinute, setReserveMinute, reserveAmpm, setReserveAmpm, confirmedReservation, setConfirmedReservation, dateOptions, pickupCoords, dropCoords, userLocation, setUserLocation, nearbyDrivers, setNearbyDrivers, mapReady, setMapReady, routeCoordinates, setRouteCoordinates, mapRef, stops } = useRideConfirmationInsets();
  const { validStops, pickupIsValid, dropIsValid, tripCoordinates, fitTripToMap, initialRegion } = useRideConfirmationValidStops(pickupCoords, dropCoords, mapRef, stops);
  const {  } = useRideConfirmationPart3(params, selectedTier, pickupCoords, dropCoords, setNearbyDrivers, mapReady, setRouteCoordinates, stops, validStops, pickupIsValid, dropIsValid, tripCoordinates, fitTripToMap);
  const { getDisplayName, handleShareRoute, handleAddStopFromMap, handleRecenter } = useRideConfirmationGetDisplayName(params, setUserLocation, mapRef, stops, pickupIsValid, dropIsValid, fitTripToMap);
  const { placeOrder } = useRideConfirmationPlaceOrder(params, selectedTier, tierFares, setBooking, setShowDatePicker, setConfirmedReservation, pickupCoords, dropCoords, stops);
  const { t } = useTranslation();
  const ENABLED_TIERS = useMemo(() => getEnabledTiers(), [t]);

  return {
  insets, params, tokens, accent, styles, selectedTier, setSelectedTier, tierFares, loadingFares,
  booking, showDatePicker, setShowDatePicker, reserveDate, setReserveDate, reserveHour,
  setReserveHour, reserveMinute, setReserveMinute, reserveAmpm, setReserveAmpm,
  confirmedReservation, dateOptions, pickupCoords, dropCoords, userLocation, nearbyDrivers,
  setMapReady, routeCoordinates, mapRef, validStops, pickupIsValid, dropIsValid, tripCoordinates,
  fitTripToMap, initialRegion, getDisplayName, handleShareRoute, handleAddStopFromMap,
  handleRecenter, placeOrder, ENABLED_TIERS
  };
}

