import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { usePackageDeliveryStore, type PackageDeliveryPointKind } from "@/contexts/packageDeliveryStore";
import { checkZone, getPlaceDetails, searchPlacesJsonBiased } from "@/services/places.service";
import { getAddresses, type SavedAddress } from "@/services/users.service";
import { showAlert } from "@/components/ui/AppAlert";
import { createPackageDeliverySearchStyles } from "./packageDeliverySearch.styles";
import { usePackageDeliveryTheme } from "./usePackageDeliveryTheme";
import { locateDevice, toPhone10 } from "./packageDelivery.utils";

// State and handlers for app/package-delivery/search.tsx. Whatever the customer picks — a search
// result, a saved address or where they are — goes on to the contact-details step.

export interface PlaceResult {
  id: string;
  name?: string;
  address: string;
  main_text?: string;
  secondary_text?: string;
  lat?: number;
  lng?: number;
}

interface ChosenPlace {
  address: string;
  lat: number;
  lng: number;
  contactName?: string;
  contactPhone?: string;
}

/** Saved addresses carry their point as GeoJSON ([lng, lat]) or as a coordinates pair. */
const savedCoords = (a: SavedAddress) => {
  const geo = a.location?.coordinates;
  const lat = Number(geo?.[1] ?? a.coordinates?.lat ?? a.lat);
  const lng = Number(geo?.[0] ?? a.coordinates?.lng ?? a.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) ? { lat, lng } : null;
};

export function usePackageDeliverySearch() {
  const { t } = useTranslation();
  const { insets, tokens, accent, styles } = usePackageDeliveryTheme(createPackageDeliverySearchStyles);
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string }>();
  const kind: PackageDeliveryPointKind = kindParam === "pickup" ? "pickup" : "drop";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    getAddresses()
      .then((list) => setSaved(Array.isArray(list) ? list.filter((a) => savedCoords(a)).slice(0, 5) : []))
      .catch(() => {});
  }, []);

  // Debounced search, biased towards the other end of the trip (or this one, when changing it).
  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) {
      requestId.current++;
      setResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }
    const id = ++requestId.current;
    setSearching(true);
    const timer = setTimeout(async () => {
      const { pickup, drop } = usePackageDeliveryStore.getState();
      const bias = pickup ?? drop;
      const locationQuery = bias ? `&lat=${encodeURIComponent(String(bias.lat))}&lng=${encodeURIComponent(String(bias.lng))}` : "";
      try {
        const data = await searchPlacesJsonBiased(text, locationQuery);
        if (id === requestId.current) {
          setResults(Array.isArray(data) ? data : []);
          setSearchError("");
        }
      } catch {
        if (id === requestId.current) {
          setResults([]);
          setSearchError(t("app.packageDelivery.searchFailed"));
        }
      } finally {
        if (id === requestId.current) setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, t]);

  const goToDetails = async (place: ChosenPlace) => {
    const zone = await checkZone(place.lat, place.lng).catch(() => null);
    if (zone && !zone.inZone) {
      showAlert(t("app.packageDelivery.noServiceTitle"), kind === "pickup" ? t("app.packageDelivery.noServicePickup") : t("app.packageDelivery.noServiceDrop"), undefined, "warning");
      return;
    }
    router.push({
      pathname: "/package-delivery/details",
      params: {
        kind,
        address: place.address,
        lat: String(place.lat),
        lng: String(place.lng),
        ...(place.contactName ? { contactName: place.contactName } : {}),
        ...(place.contactPhone ? { contactPhone: place.contactPhone } : {}),
      },
    });
  };

  /** Runs one selection at a time and shows which row is working. */
  const withBusy = async (id: string, task: () => Promise<void>) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await task();
    } catch (error) {
      console.warn("Package delivery: could not use that place", error);
      showAlert(t("app.packageDelivery.placeFailedTitle"), t("app.packageDelivery.placeFailedBody"), undefined, "error");
    } finally {
      setBusyId(null);
    }
  };

  const selectResult = (result: PlaceResult) =>
    withBusy(result.id, async () => {
      const coords = Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lng))
        ? { lat: Number(result.lat), lng: Number(result.lng) }
        : await getPlaceDetails(result.id);
      await goToDetails({ address: result.address, lat: coords.lat, lng: coords.lng });
    });

  const selectSaved = (address: SavedAddress) =>
    withBusy(String(address._id || address.id || address.addressLine), async () => {
      const coords = savedCoords(address);
      if (!coords) return;
      await goToDetails({
        address: address.addressLine || address.address || "",
        ...coords,
        contactName: address.receiverName || undefined,
        contactPhone: toPhone10(address.receiverPhone || address.phone) || undefined,
      });
    });

  const pickCurrentLocation = () =>
    withBusy("current", async () => {
      const here = await locateDevice();
      if (!here) {
        showAlert(t("app.packageDelivery.locationOffTitle"), t("app.packageDelivery.locationOffBody"), undefined, "warning");
        return;
      }
      await goToDetails(here);
    });

  return {
    insets, tokens, accent, styles, kind, query, setQuery, results, searching, searchError, saved, busyId,
    selectResult, selectSaved, pickCurrentLocation, goBack: () => router.back(),
  };
}
