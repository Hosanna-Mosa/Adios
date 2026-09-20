import { useLocationSelectionInsets } from "./useLocationSelectionInsets";
import { useLocationSelectionPart2 } from "./useLocationSelectionPart2";
import { useLocationSelectionFetchingLocation } from "./useLocationSelectionFetchingLocation";
import { useLocationSelectionSelectSavedAddress } from "./useLocationSelectionSelectSavedAddress";

// State, data loading and handlers for app/drop-location.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useLocationSelection() {
  const { insets, params, serviceId, name, tokens, accent, styles, user, pickup, setPickup, drop, setDrop, stops, setStops, showBookingForSheet, setShowBookingForSheet, bookingFor, setBookingFor, someoneContact, setSomeoneContact, recentPlaces, setRecentPlaces, savedAddresses, setSavedAddresses, savingPreference, setSavingPreference, isNavigating, setIsNavigating } = useLocationSelectionInsets();
  const {  } = useLocationSelectionPart2(user, setBookingFor, setSomeoneContact, setRecentPlaces, setSavedAddresses);
  const { fetchingLocation, setFetchingLocation, searchResults, isSearching, searchLoading, searchText, searchError, focusedInput, setFocusedInput, fieldText, clearField, handleFieldChange, pickupRef, dropRef, handleSearch, selectResult, handleSelection, handleAddStop, handleRemoveStop, handleStopSelection } = useLocationSelectionFetchingLocation(params, serviceId, name, user, pickup, setPickup, drop, setDrop, stops, setStops, bookingFor, someoneContact, setRecentPlaces, setIsNavigating);
  const { selectSavedAddress, handleCurrentLocation } = useLocationSelectionSelectSavedAddress(params, serviceId, name, pickup, setPickup, drop, stops, bookingFor, someoneContact, setFetchingLocation, pickupRef, dropRef, handleSelection);

  return {
  insets, serviceId, name, tokens, accent, styles, user, pickup, drop, stops, showBookingForSheet,
  setShowBookingForSheet, bookingFor, setBookingFor, someoneContact, setSomeoneContact,
  recentPlaces, savedAddresses, savingPreference, setSavingPreference, isNavigating,
  fetchingLocation, searchResults, isSearching, searchLoading, searchText, searchError,
  focusedInput, setFocusedInput, fieldText, clearField, handleFieldChange,
  pickupRef, dropRef, handleSearch, selectResult, handleSelection, handleAddStop,
  handleRemoveStop, handleStopSelection, selectSavedAddress, handleCurrentLocation
  };
}

