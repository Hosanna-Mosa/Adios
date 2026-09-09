import { usePickupConfirmationInsets } from "./usePickupConfirmationInsets";
import { usePickupConfirmationLoadingEstimate } from "./usePickupConfirmationLoadingEstimate";
import { usePickupConfirmationRecenter } from "./usePickupConfirmationRecenter";

// State, data loading and handlers for app/pickup-confirmation.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function usePickupConfirmation() {
  const { insets, tokens, accent, styles, mapRef, params, pickupCoords, confirmedPickup, setConfirmedPickup, estimate, setEstimate } = usePickupConfirmationInsets();
  const { loadingEstimate } = usePickupConfirmationLoadingEstimate(params, confirmedPickup, estimate, setEstimate);
  const { recenter, updatePickup, useCurrentLocation } = usePickupConfirmationRecenter(mapRef, params, confirmedPickup, setConfirmedPickup, estimate);

  return {
  insets, tokens, accent, styles, mapRef, params, pickupCoords, confirmedPickup, estimate,
  loadingEstimate, recenter, updatePickup, useCurrentLocation
  };
}

