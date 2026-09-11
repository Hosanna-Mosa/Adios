import { useMapPickerInsets } from "./useMapPickerInsets";
import { useMapPickerHandleRegionChangeComplete } from "./useMapPickerHandleRegionChangeComplete";

// State, data loading and handlers for app/map-picker.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useMapPicker() {
  const { insets, params, serviceId, tokens, accent, styles, step, region, setRegion, address, setAddress, loading, setLoading, recentering, setRecentering, mapRef, latLabel, lngLabel } = useMapPickerInsets();
  const { handleRegionChangeComplete, handleUseCurrentLocation, handleConfirm } = useMapPickerHandleRegionChangeComplete(params, serviceId, step, region, setRegion, address, setAddress, setLoading, setRecentering, mapRef);

  return {
  insets, tokens, accent, styles, step, region, address, loading, recentering, mapRef, latLabel,
  lngLabel, handleRegionChangeComplete, handleUseCurrentLocation, handleConfirm
  };
}

