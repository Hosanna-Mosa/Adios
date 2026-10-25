import { useEffect } from "react";
import * as Location from "expo-location";
import { searchPlaces } from "@/services/places.service";
import { usePlaceSearchRunner } from "./placeSearch";

// Split out of useAddAddress so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useAddAddressOnRegionChangeComplete(isEditMode: any, setShortAddress: any, setCityOrCountry: any, setRegion: any, setSearchQuery: any, setSearchResults: any, setSearching: any, userCoords: any, setUserCoords: any, setIsResolvingAddress: any, isMapReady: any, fetchAddressForCoords: any) {
  const placeSearch = usePlaceSearchRunner();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  const onRegionChangeComplete = async (r: any) => {
    setRegion(r);
    setIsResolvingAddress(true);
    if (isEditMode && !isMapReady.current) {
      isMapReady.current = true;
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude });
        if (place) {
          setShortAddress(place.name || place.street || place.city || "Selected location");
          setCityOrCountry([place.city, place.region].filter(Boolean).join(", ") || "India");
        }
      } catch {} finally {
        setIsResolvingAddress(false);
      }
      return;
    }
    await fetchAddressForCoords(r.latitude, r.longitude);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const locQuery = userCoords ? `&lat=${userCoords.lat}&lng=${userCoords.lng}&radius=50000` : "";
    placeSearch.run(text, (q) => searchPlaces(q, locQuery), setSearchResults, setSearching);
  };

  return { onRegionChangeComplete, handleSearch };
}
