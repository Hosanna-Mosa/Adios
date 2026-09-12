import { useEffect } from "react";
import * as Location from "expo-location";
import { searchPlaces } from "@/services/places.service";

// Split out of useAddAddress so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useAddAddressOnRegionChangeComplete(isEditMode: any, setShortAddress: any, setCityOrCountry: any, setRegion: any, setSearchQuery: any, setSearchResults: any, setSearching: any, userCoords: any, setUserCoords: any, setIsResolvingAddress: any, isMapReady: any, fetchAddressForCoords: any) {
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

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      setSearching(true);
      try {
        const locQuery = userCoords ? `&lat=${userCoords.lat}&lng=${userCoords.lng}&radius=50000` : "";
        const results = await searchPlaces(text, locQuery);
        setSearchResults(results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  return { onRegionChangeComplete, handleSearch };
}
