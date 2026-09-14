import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { RecentPlace, recentLocationsKeyFor, toRecentPlace } from "./useLocationSelection.shared";
import { buildHandleSearch, buildHandleSelection } from "./useLocationSelectionFetchingLocation.handlers";
import { buildHandleStopSelection } from "./useLocationSelectionFetchingLocation.stops";

// Part 3 of useLocationSelection, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useLocationSelectionFetchingLocation(params: any, serviceId: any, name: any, user: any, pickup: any, setPickup: any, drop: any, setDrop: any, stops: any, setStops: any, bookingFor: any, someoneContact: any, setRecentPlaces: any, setIsNavigating: any) {
  useEffect(() => {
    // Handle initial state from params
    if (params.pickupName && params.pickupLat) {
      setPickup({
        name: params.pickupName,
        lat: parseFloat(params.pickupLat),
        lng: parseFloat(params.pickupLng || "0"),
      });
      pickupRef.current?.setAddressText(params.pickupName);
      setFieldText((current) => ({ ...current, pickup: params.pickupName }));
    }
    if (params.dropName && params.dropLat) {
      setDrop({
        name: params.dropName,
        lat: parseFloat(params.dropLat),
        lng: parseFloat(params.dropLng || "0"),
      });
      dropRef.current?.setAddressText(params.dropName);
      setFieldText((current) => ({ ...current, drop: params.dropName }));
    }
    if (params.stops) {
      try {
        const parsedStops = JSON.parse(params.stops);
        setStops(parsedStops);
      } catch (e) {
        console.error("Error parsing stops:", e);
      }
    }

    if (params.triggerAddStop === "true") {
      handleAddStop();
      // Clear the trigger by setting params to empty would be ideal,
      // but since params are reactive, we just rely on state.
    }

    // Auto-navigation only if both pickup and drop are set AND not in adding stop mode
    if (params.pickupName && params.pickupLat && params.dropName && params.dropLat && params.triggerAddStop !== "true") {
      router.push({
        pathname: "/ride-confirmation",
        params: {
          serviceId,
          pickupName: params.pickupName,
          dropName: params.dropName,
          pickupLat: params.pickupLat,
          pickupLng: params.pickupLng,
          dropLat: params.dropLat,
          dropLng: params.dropLng,
          stops: params.stops,
          bookingForType: bookingFor,
          riderContact: someoneContact,
        }
      });
    }
  }, [params.pickupName, params.pickupLat, params.dropName, params.dropLat, params.stops]);

  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState("");
  const [focusedInput, setFocusedInput] = useState<{ type: 'pickup' | 'drop' | 'stop', id?: string } | null>(null);
  // What each field currently shows. GooglePlacesAutocomplete keeps its text
  // internally, so this is the only way to know whether a field has anything in
  // it — which is what decides whether the clear button is rendered.
  const [fieldText, setFieldText] = useState<{ pickup: string; drop: string }>({ pickup: "", drop: "" });

  const pickupRef = useRef<any>(null);
  const dropRef = useRef<any>(null);
  const searchRequestIdRef = useRef(0);

  const saveRecentPlace = async (placeInput: Partial<RecentPlace> & { description?: string }) => {
    const place = toRecentPlace(placeInput);
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng) || !place.address) return;

    setRecentPlaces((current: any) => {
      const updated = [
        place,
        ...current.filter((item: any) => item.address !== place.address && item.id !== place.id),
      ].slice(0, 8);

      AsyncStorage.setItem(recentLocationsKeyFor(user?.id), JSON.stringify(updated)).catch((error) => {
        console.error("Failed to save recent place:", error);
      });

      return updated;
    });
  };

  const handleSearch = buildHandleSearch(setSearchResults, setIsSearching, setSearchLoading, setSearchText, setSearchError, setFocusedInput, searchRequestIdRef, pickup);

  const handleFieldChange = (type: 'pickup' | 'drop' | 'stop', id?: string) => (text: string) => {
    if (type !== 'stop') setFieldText((current) => ({ ...current, [type]: text }));
    handleSearch(text, type, id);
  };

  // Empties one field completely — the address, the typed text and the suggestion
  // list it was driving — and hands focus back so the next address can be typed.
  const clearField = (type: 'pickup' | 'drop') => {
    const ref = type === 'pickup' ? pickupRef : dropRef;
    ref.current?.setAddressText("");
    setFieldText((current) => ({ ...current, [type]: "" }));
    if (type === 'pickup') setPickup(null);
    else setDrop(null);
    setSearchResults([]);
    setIsSearching(false);
    setSearchLoading(false);
    setSearchText("");
    setFocusedInput({ type });
    ref.current?.focus?.();
  };

  const selectResult = async (result: any) => {
    try {
      const details = Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lng))
        ? { lat: Number(result.lat), lng: Number(result.lng) }
        : await customFetch<{ lat: number, lng: number }>(`/places/details/${result.id}`);
      const completeData = {
        description: result.address,
        lat: details.lat,
        lng: details.lng,
        name: result.name
      };

      if (focusedInput?.type === 'pickup') {
        pickupRef.current?.setAddressText(result.address);
        handleSelection('pickup', completeData, null);
      } else if (focusedInput?.type === 'drop') {
        dropRef.current?.setAddressText(result.address);
        handleSelection('drop', completeData, null);
      } else if (focusedInput?.type === 'stop' && focusedInput.id) {
        handleStopSelection(focusedInput.id, completeData, null);
      }

      setSearchResults([]);
      setIsSearching(false);
      setSearchLoading(false);
      setSearchText("");
    } catch (e) {
      console.error("Selection error:", e);
    }
  };

  const setFieldTextFor = (type: 'pickup' | 'drop', text: string) =>
    setFieldText((current) => ({ ...current, [type]: text }));

  const handleSelection = buildHandleSelection(pickupRef, dropRef, saveRecentPlace, params, serviceId, name, pickup, setPickup, drop, setDrop, stops, bookingFor, someoneContact, setIsNavigating, setFieldTextFor);

  const handleAddStop = () => {
    setStops([...stops, { id: Date.now().toString(), name: "", lat: 0, lng: 0 }]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter((s: any) => s.id !== id));
  };

  const handleStopSelection = buildHandleStopSelection(saveRecentPlace, setStops);

  return { fetchingLocation, setFetchingLocation, searchResults, isSearching, searchLoading, searchText, searchError, focusedInput, setFocusedInput, fieldText, clearField, handleFieldChange, pickupRef, dropRef, handleSearch, selectResult, handleSelection, handleAddStop, handleRemoveStop, handleStopSelection };
}
