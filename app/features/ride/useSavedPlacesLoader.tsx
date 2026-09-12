import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RECENT_LOCATIONS_KEY, recentLocationsKeyFor, toRecentPlace } from "./useLocationSelection.shared";
import { getAddresses, getProfile } from "@/services/users.service";

// Split out of useLocationSelection so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useSavedPlacesLoader(user: any, setBookingFor: any, setSomeoneContact: any, setRecentPlaces: any, setSavedAddresses: any) {
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const profile = await getProfile();
        if (profile?.bookingPreference?.type) {
          setBookingFor(profile.bookingPreference.type);
          if (profile.bookingPreference.contactNumber) {
            setSomeoneContact(profile.bookingPreference.contactNumber);
          }
        }
      } catch {
        // Profile preference is optional
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    getAddresses()
      .then((data) => setSavedAddresses(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    const loadRecentPlaces = async () => {
      try {
        const accountKey = recentLocationsKeyFor(user?.id);
        const stored = await AsyncStorage.getItem(accountKey);
        const legacyStored = user?.id && !stored ? await AsyncStorage.getItem(RECENT_LOCATIONS_KEY) : null;
        const parsed = JSON.parse(stored || legacyStored || "[]");

        if (mounted && Array.isArray(parsed)) {
          setRecentPlaces(
            parsed
              .map(toRecentPlace)
              .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng))
              .slice(0, 8)
          );
        }
      } catch (error) {
        console.error("Failed to load recent places:", error);
      }
    };

    loadRecentPlaces();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return {  };
}
