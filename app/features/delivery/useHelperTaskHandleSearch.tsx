import { getPlaceDetails, searchPlacesJson } from "@/services/places.service";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.
//
// There is no distance limit here: the screen was never opened with the `radius`
// it used to check against, so that check could not run. Whether helpers work at
// a place is the server's call (zones, dispatch), not the app's.

export function useHelperTaskHandleSearch(setPickupLocation: any, setDropoffLocation: any, setPickupCoords: any, setDropoffCoords: any, activeField: any, setActiveField: any, setSearchResults: any, setIsPickupValid: any, setIsDropoffValid: any) {
  const handleSearch = async (text: string, type: "pickup" | "dropoff") => {
    if (type === "pickup") { setPickupLocation(text); setIsPickupValid(false); }
    else { setDropoffLocation(text); setIsDropoffValid(false); }
    setActiveField(type);
    if (text.trim().length < 2) { setSearchResults([]); return; }
    try {
      const data = await searchPlacesJson(text);
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
        const details = await getPlaceDetails(result.id);
        if (details?.lat) { lat = details.lat; lng = details.lng; }
      }
    } catch (e) {
      console.error("Failed to fetch place details:", e);
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
