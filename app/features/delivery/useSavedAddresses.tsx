import { useSavedAddressesInsets } from "./useSavedAddressesInsets";
import { useSavedAddressesHandleUseCurrentLocation } from "./useSavedAddressesHandleUseCurrentLocation";
import { useSavedAddressesHandleEditAddress } from "./useSavedAddressesHandleEditAddress";

// State, data loading and handlers for app/delivery/saved-addresses.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useSavedAddresses() {
  const { insets, tokens, accent, styles, user, setUser, addresses, setAddresses, loading, selectingId, setSelectingId, deletingId, setDeletingId, recentLocations, recentLoading, currentLocLoading, setCurrentLocLoading } = useSavedAddressesInsets();
  const { handleUseCurrentLocation, handleSelectRecentLocation, handleSelectAddress } = useSavedAddressesHandleUseCurrentLocation(selectingId, setSelectingId, deletingId, currentLocLoading, setCurrentLocLoading);
  const { handleMoreOptions, parseInstructions, stripMeta, isEmpty } = useSavedAddressesHandleEditAddress(user, setUser, addresses, setAddresses, loading, selectingId, deletingId, setDeletingId);

  return {
  insets, tokens, accent, styles, addresses, loading, selectingId, deletingId, recentLocations,
  recentLoading, currentLocLoading, handleUseCurrentLocation, handleSelectRecentLocation,
  handleSelectAddress, handleMoreOptions, parseInstructions, stripMeta, isEmpty
  };
}

