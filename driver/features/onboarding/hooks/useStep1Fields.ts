import { useCallback, useState } from "react";

import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";

export type Step1Fields = ReturnType<typeof useStep1Fields>;

export function useStep1Fields() {
  const [gender, setGender] = useState<string | null>(null);
  const [homeAddressLine, setHomeAddressLine] = useState("");
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLng, setHomeLng] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [preferredZone, setPreferredZone] = useState<string | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [zoneSearchText, setZoneSearchText] = useState("");
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const token = useDriverStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${API_URL}/places/autocomplete?input=${encodeURIComponent(query)}`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Failed to fetch autocomplete suggestions:", err);
    }
  }, []);

  return {
    gender, setGender,
    homeAddressLine, setHomeAddressLine,
    homeLat, setHomeLat,
    homeLng, setHomeLng,
    suggestions, setSuggestions, fetchSuggestions,
    vehicle, setVehicle,
    preferredZone, setPreferredZone,
    zones, setZones,
    zoneSearchText, setZoneSearchText,
    isZoneDropdownOpen, setIsZoneDropdownOpen,
  };
}
