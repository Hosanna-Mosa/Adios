import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { customFetch } from "@/utils/api/custom-fetch";
import { RECENT_LOCATIONS_KEY, recentLocationsKeyFor, toRecentPlace } from "./useLocationSelection.shared";

// Part 2 of useLocationSelection, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useLocationSelectionPart2(user: any, setBookingFor: any, setSomeoneContact: any, setRecentPlaces: any, setSavedAddresses: any) {
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const profile = await customFetch<any>("/users/profile");
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
    customFetch<any[]>("/users/addresses")
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
