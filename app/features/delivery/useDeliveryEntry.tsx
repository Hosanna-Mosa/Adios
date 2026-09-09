import { useDeliveryEntryStops } from "./useDeliveryEntryStops";
import { useDeliveryEntryHandleStopPress } from "./useDeliveryEntryHandleStopPress";

// State, data loading and handlers for app/delivery/entry.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useDeliveryEntry() {
  const { stops, route, price, currentLocation, currentCoords, removeStop, setStops, setRoute, calculatePrice, insets, tokens, accent, styles, isCalculating, setIsCalculating, isLocating, mapRef, handleLocationUpdate, handleRecenter } = useDeliveryEntryStops();
  const { handleStopPress, handleReview } = useDeliveryEntryHandleStopPress(stops, route, price, currentCoords, setStops, setRoute, calculatePrice, setIsCalculating, mapRef);

  return {
  stops, route, price, currentLocation, removeStop, insets, tokens, accent, styles, isCalculating,
  isLocating, mapRef, handleLocationUpdate, handleRecenter, handleStopPress, handleReview
  };
}

