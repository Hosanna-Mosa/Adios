import { router } from "expo-router";
import { checkZone, searchPlacesJsonBiased } from "@/services/places.service";
import { showAlert } from "@/components/ui/AppAlert";

// Handlers lifted out of useLocationSelectionFetchingLocation: factories over the values they closed
// over, rebuilt every render exactly as the inline versions were.

export const buildHandleSelection = (pickupRef: any, dropRef: any, saveRecentPlace: any, params: any, serviceId: any, name: any, pickup: any, setPickup: any, drop: any, setDrop: any, stops: any, bookingFor: any, someoneContact: any, setIsNavigating: any, setFieldTextFor: (type: 'pickup' | 'drop', text: string) => void) =>
  async (type: 'pickup' | 'drop', data: any, details: any = null) => {
    const lat = details?.geometry?.location?.lat || data.lat;
    const lng = details?.geometry?.location?.lng || data.lng;
    const addrName = data.description || data.name;
    const placeId = data.place_id || data.id || details?.place_id;
    const placeName = data.structured_formatting?.main_text || data.name || addrName?.split(",")?.[0]?.trim();

    if (lat && lng) {
      try {
        const checkRes = await checkZone(lat, lng);
        if (!checkRes || !checkRes.inZone) {
          showAlert("No Service", `No service at current ${type} location.`);
          if (type === 'pickup') {
            pickupRef.current?.setAddressText("");
            setPickup(null);
          } else {
            dropRef.current?.setAddressText("");
            setDrop(null);
          }
          setFieldTextFor(type, "");
          return;
        }
      } catch (err) {
        console.error("Zone check failed:", err);
      }
    }

    saveRecentPlace({
      id: placeId || addrName,
      name: placeName,
      address: addrName,
      lat,
      lng,
    });

    if (type === 'pickup') {
      setPickup({ name: addrName, lat, lng });
    } else {
      setDrop({ name: addrName, lat, lng });
    }
    setFieldTextFor(type, addrName);

    const currentPickup = type === 'pickup' ? { name: addrName, lat, lng } : pickup;
    const currentDrop = type === 'drop' ? { name: addrName, lat, lng } : drop;

    if (currentPickup && currentDrop && currentPickup.lat && currentDrop.lat) {
        setIsNavigating(true);
        router.push({
            pathname: "/ride-confirmation",
            params: {
                serviceId,
                pickupName: currentPickup.name,
                dropName: currentDrop.name,
                pickupLat: currentPickup.lat.toString(),
                pickupLng: currentPickup.lng.toString(),
                dropLat: currentDrop.lat.toString(),
                dropLng: currentDrop.lng.toString(),
                stops: JSON.stringify(stops),
                bookingForType: bookingFor,
                riderContact: someoneContact,
            }
        });
    }
  };

export const buildHandleSearch = (setSearchResults: any, setIsSearching: any, setSearchLoading: any, setSearchText: any, setSearchError: any, setFocusedInput: any, searchRequestIdRef: any, pickup: any) =>
  async (text: string, type: 'pickup' | 'drop' | 'stop', id?: string) => {
    setFocusedInput({ type, id });
    setSearchText(text);
    setSearchError("");
    if (!text || text.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchLoading(false);
      return;
    }
    const requestId = ++searchRequestIdRef.current;
    setIsSearching(true);
    setSearchLoading(true);
    try {
      const locationQuery = pickup?.lat && pickup?.lng
        ? `&lat=${encodeURIComponent(String(pickup.lat))}&lng=${encodeURIComponent(String(pickup.lng))}`
        : "";
      const data = await searchPlacesJsonBiased(text, locationQuery);
      if (requestId === searchRequestIdRef.current) {
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Search error:", e);
      if (requestId === searchRequestIdRef.current) {
        setSearchResults([]);
        setSearchError("Could not load places. Check your connection and try again.");
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setSearchLoading(false);
      }
    }
  };
