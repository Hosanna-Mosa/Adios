import { useTranslation } from "react-i18next";
import { getDistanceFromLatLonInKm } from "./useHelperTask.shared";
import { getPlaceDetails, searchPlacesJson } from "@/services/places.service";
import { showAlert } from "@/components/ui/AppAlert";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHelperTaskHandleSearch(radius: any, currentCoords: any, setPickupLocation: any, setDropoffLocation: any, setPickupCoords: any, setDropoffCoords: any, activeField: any, setActiveField: any, setSearchResults: any, setIsPickupValid: any, setIsDropoffValid: any) {
  const { t } = useTranslation();
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
      if (currentCoords && radius && lat !== null && lng !== null) {
        const distance = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lng, lat, lng);
        if (distance > parseFloat(radius)) {
          showAlert(t("app.delivery.outOfRange"), t("app.delivery.thisLocationIsOutsideYourSelected", { value: radius }));
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
