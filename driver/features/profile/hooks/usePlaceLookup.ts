import { useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";

/** Address autocomplete and "use my current location".
 * Split out of useAddressForm to keep both files under 150 lines. */
export function usePlaceLookup({
  setAddressLine,
  setAddressLat,
  setAddressLng,
}: {
  setAddressLine: (v: string) => void;
  setAddressLat: (v: number | null) => void;
  setAddressLng: (v: number | null) => void;
}) {
  const { token } = useDriverStore();
  const [fetchingLoc, setFetchingLoc] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/places/autocomplete?input=${encodeURIComponent(query)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Failed to fetch autocomplete suggestions:", err);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setFetchingLoc(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permissions are required to fetch your current location.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const { latitude, longitude } = loc.coords;
      setAddressLat(latitude);
      setAddressLng(longitude);

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (geocode) {
        const parts = [
          geocode.name,
          geocode.street,
          geocode.district,
          geocode.city,
          geocode.subregion,
          geocode.region,
          geocode.postalCode,
          geocode.country
        ].filter(Boolean);

        setAddressLine(parts.join(", "));
      } else {
        setAddressLine(`Coords: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch current location.");
    } finally {
      setFetchingLoc(false);
    }
  };

  return { fetchingLoc, suggestions, setSuggestions, fetchSuggestions, handleGetCurrentLocation };
}
