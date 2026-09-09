import { useAddStopInsets } from "./useAddStopInsets";
import { useAddStopHandleAddressInput } from "./useAddStopHandleAddressInput";
import { useAddStopHandleAddStop } from "./useAddStopHandleAddStop";

// State, data loading and handlers for app/delivery/add-stop.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useAddStop() {
  const { insets, tokens, accent, styles, address, setAddress, addressInput, setAddressInput, storeName, setStoreName, items, setItems, newItemName, setNewItemName, newItemPrice, setNewItemPrice, coords, setCoords, nearbySuggestions, autocompleteSuggestions, setAutocompleteSuggestions, isSearching, showDropdown, setShowDropdown, previewDelta, setPreviewDelta, isPreviewing, setIsPreviewing, addStop, currentCoords, stops, route, price, fetchAutocompleteSuggestions } = useAddStopInsets();
  const { handleAddressInput, handleSelectSuggestion } = useAddStopHandleAddressInput(address, setAddress, setAddressInput, storeName, setStoreName, coords, setCoords, setAutocompleteSuggestions, setShowDropdown, setPreviewDelta, setIsPreviewing, currentCoords, stops, route, fetchAutocompleteSuggestions);
  const { handleAddStop, addItemToLocal, removeItemFromLocal } = useAddStopHandleAddStop(address, storeName, items, setItems, newItemName, setNewItemName, newItemPrice, setNewItemPrice, coords, addStop);

  return {
  insets, tokens, accent, styles, address, addressInput, storeName, setStoreName, items,
  newItemName, setNewItemName, newItemPrice, setNewItemPrice, nearbySuggestions,
  autocompleteSuggestions, isSearching, showDropdown, setShowDropdown, previewDelta, isPreviewing,
  currentCoords, stops, route, price, handleAddressInput, handleSelectSuggestion, handleAddStop,
  addItemToLocal, removeItemFromLocal
  };
}

