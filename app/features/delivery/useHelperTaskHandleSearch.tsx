import { Alert } from "react-native";
import { customFetch } from "@/utils/api/custom-fetch";
import { getDistanceFromLatLonInKm } from "./useHelperTask.shared";

// Part 3 of useHelperTask, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHelperTaskHandleSearch(radius: any, currentCoords: any, setPickupLocation: any, setDropoffLocation: any, setPickupCoords: any, setDropoffCoords: any, activeField: any, setActiveField: any, setSearchResults: any, setIsPickupValid: any, setIsDropoffValid: any) {
  const handleSearch = async (text: string, type: "pickup" | "dropoff") => {
    if (type === "pickup") { setPickupLocation(text); setIsPickupValid(false); }
    else { setDropoffLocation(text); setIsDropoffValid(false); }
    setActiveField(type);
    if (text.trim().length < 2) { setSearchResults([]); return; }
    try {
      const data = await customFetch<any[]>(`/places/autocomplete?input=${encodeURIComponent(text)}`, { responseType: "json" });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    }
  };

  const selectResult = async (result: any) => {
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      if (Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lng))) {
        lat = Number(result.lat);
        lng = Number(result.lng);
      } else if (result.id) {
        const details = await customFetch<{ lat: number; lng: number }>(`/places/details/${result.id}`);
        if (details?.lat) { lat = details.lat; lng = details.lng; }
      }
      if (currentCoords && radius && lat !== null && lng !== null) {
        const distance = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lng, lat, lng);
        if (distance > parseFloat(radius)) {
          Alert.alert("Out of range", `This location is outside your selected ${radius}km radius.`);
          setSearchResults([]);
          setActiveField(null);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch/validate place details:", e);
    }
    const address = result.description || result.name || result.address || "";
    if (activeField === "pickup") {
      setPickupLocation(address);
      if (lat !== null && lng !== null) setPickupCoords({ lat, lng });
      setIsPickupValid(true);
    } else if (activeField === "dropoff") {
      setDropoffLocation(address);
      if (lat !== null && lng !== null) setDropoffCoords({ lat, lng });
      setIsDropoffValid(true);
    }
    setSearchResults([]);
    setActiveField(null);
  };

  return { handleSearch, selectResult };
}
