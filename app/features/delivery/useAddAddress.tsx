import { useAddAddressInsets } from "./useAddAddressInsets";
import { useAddAddressLngLabel } from "./useAddAddressLngLabel";
import { useAddAddressOnRegionChangeComplete } from "./useAddAddressOnRegionChangeComplete";
import { useAddAddressHandleSelectSearchResult } from "./useAddAddressHandleSelectSearchResult";

// State, data loading and handlers for app/delivery/add-address.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useAddAddress() {
  const { insets, router, params, mapRef, searchInputRef, tokens, accent, styles, user, setUser, isEditMode, selectedChip, setSelectedChip, label, setLabel, addressLine, setAddressLine, completeAddress, setCompleteAddress, instructions, setInstructions, phone, receiverName, setReceiverName, receiverPhone, setReceiverPhone, landmark, setLandmark, shortAddress, setShortAddress, cityOrCountry, setCityOrCountry, loading, setLoading, step, setStep, region, setRegion, searchQuery, setSearchQuery, searchResults, setSearchResults, searching, setSearching, userCoords, setUserCoords, isResolvingAddress, setIsResolvingAddress, isMapReady, latLabel } = useAddAddressInsets();
  const { lngLabel, fetchAddressForCoords, handleUseCurrentLocation } = useAddAddressLngLabel(params, mapRef, isEditMode, setSelectedChip, setLabel, setAddressLine, setCompleteAddress, setInstructions, setShortAddress, setCityOrCountry, setLoading, region, setRegion, setIsResolvingAddress);
  const { onRegionChangeComplete, handleSearch } = useAddAddressOnRegionChangeComplete(isEditMode, setShortAddress, setCityOrCountry, setRegion, setSearchQuery, setSearchResults, setSearching, userCoords, setUserCoords, setIsResolvingAddress, isMapReady, fetchAddressForCoords);
  const { handleSelectSearchResult, handleSave } = useAddAddressHandleSelectSearchResult(router, params, mapRef, user, setUser, isEditMode, selectedChip, label, addressLine, completeAddress, instructions, phone, receiverName, receiverPhone, landmark, setLoading, region, setRegion, setSearchQuery, setSearchResults, fetchAddressForCoords);

  return {
  insets, router, mapRef, searchInputRef, tokens, accent, styles, isEditMode, selectedChip,
  setSelectedChip, label, setLabel, addressLine, setAddressLine, completeAddress,
  setCompleteAddress, instructions, setInstructions, receiverName, setReceiverName, receiverPhone,
  setReceiverPhone, landmark, setLandmark, shortAddress, cityOrCountry, loading, step, setStep,
  region, searchQuery, searchResults, searching, isResolvingAddress, latLabel, lngLabel,
  handleUseCurrentLocation, onRegionChangeComplete, handleSearch, handleSelectSearchResult,
  handleSave
  };
}

