import React, { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, KeyboardAvoidingView, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { RouteInputCard } from "@/features/ride/components/RouteInputCard";
import { DropActionRow } from "@/features/ride/components/DropActionRow";
import { PlacesList } from "@/features/ride/components/PlacesList";
import { BookingForSheet } from "@/features/ride/components/BookingForSheet";
import { createStyles } from "@/features/ride/drop-location.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useAuthStore } from "@/contexts/authStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { DropLocationLoadingOverlay } from "@/features/ride/components/DropLocationLoadingOverlay";
import { DropLocationHeader } from "@/features/ride/components/DropLocationHeader";

type RecentPlace = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

const RECENT_LOCATIONS_KEY = "recent_locations";
const recentLocationsKeyFor = (userId?: string | number | null) =>
  userId ? `${RECENT_LOCATIONS_KEY}:${userId}` : `${RECENT_LOCATIONS_KEY}:guest`;

const toRecentPlace = (place: Partial<RecentPlace> & { description?: string }) => ({
  id: String(place.id || place.address || place.description || Date.now()),
  name: place.name || place.description?.split(",")[0]?.trim() || place.address?.split(",")[0]?.trim() || "Recent place",
  address: place.address || place.description || place.name || "",
  lat: Number(place.lat),
  lng: Number(place.lng),
});

export default function LocationSelectionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    serviceId: string;
    name: string;
    pickupName?: string;
    pickupLat?: string;
    pickupLng?: string;
    dropName?: string;
    dropLat?: string;
    dropLng?: string;
    stops?: string; // JSON string
    triggerAddStop?: string;
  }>();
  const { serviceId, name } = params;

  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.ride;
  const styles = React.useMemo(() => createStyles(tokens, accent), [theme]);
  const { user } = useAuthStore();
  const setServiceType = useDeliveryStore((state) => state.setServiceType);

  useEffect(() => {
    if (serviceId) {
      setServiceType(serviceId);
    }
  }, [serviceId, setServiceType]);

  const [pickup, setPickup] = useState<any>(null);
  const [drop, setDrop] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [showBookingForSheet, setShowBookingForSheet] = useState(false);
  const [bookingFor, setBookingFor] = useState<"myself" | "someone_else">("myself");
  const [someoneContact, setSomeoneContact] = useState("");
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [savingPreference, setSavingPreference] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

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

  useEffect(() => {
    // Handle initial state from params
    if (params.pickupName && params.pickupLat) {
      setPickup({
        name: params.pickupName,
        lat: parseFloat(params.pickupLat),
        lng: parseFloat(params.pickupLng || "0"),
      });
      pickupRef.current?.setAddressText(params.pickupName);
    }
    if (params.dropName && params.dropLat) {
      setDrop({
        name: params.dropName,
        lat: parseFloat(params.dropLat),
        lng: parseFloat(params.dropLng || "0"),
      });
      dropRef.current?.setAddressText(params.dropName);
    }
    if (params.stops) {
      try {
        const parsedStops = JSON.parse(params.stops);
        setStops(parsedStops);
      } catch (e) {
        console.error("Error parsing stops:", e);
      }
    }

    if (params.triggerAddStop === "true") {
      handleAddStop();
      // Clear the trigger by setting params to empty would be ideal,
      // but since params are reactive, we just rely on state.
    }

    // Auto-navigation only if both pickup and drop are set AND not in adding stop mode
    if (params.pickupName && params.pickupLat && params.dropName && params.dropLat && params.triggerAddStop !== "true") {
      router.push({
        pathname: "/ride-confirmation",
        params: {
          serviceId,
          pickupName: params.pickupName,
          dropName: params.dropName,
          pickupLat: params.pickupLat,
          pickupLng: params.pickupLng,
          dropLat: params.dropLat,
          dropLng: params.dropLng,
          stops: params.stops,
          bookingForType: bookingFor,
          riderContact: someoneContact,
        }
      });
    }
  }, [params.pickupName, params.pickupLat, params.dropName, params.dropLat, params.stops]);

  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState("");
  const [focusedInput, setFocusedInput] = useState<{ type: 'pickup' | 'drop' | 'stop', id?: string } | null>(null);

  const pickupRef = useRef<any>(null);
  const dropRef = useRef<any>(null);
  const searchRequestIdRef = useRef(0);

  const saveRecentPlace = async (placeInput: Partial<RecentPlace> & { description?: string }) => {
    const place = toRecentPlace(placeInput);
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng) || !place.address) return;

    setRecentPlaces((current) => {
      const updated = [
        place,
        ...current.filter((item) => item.address !== place.address && item.id !== place.id),
      ].slice(0, 8);

      AsyncStorage.setItem(recentLocationsKeyFor(user?.id), JSON.stringify(updated)).catch((error) => {
        console.error("Failed to save recent place:", error);
      });

      return updated;
    });
  };

  const handleSearch = async (text: string, type: 'pickup' | 'drop' | 'stop', id?: string) => {
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
      const data = await customFetch<any[]>(
        `/places/autocomplete?input=${encodeURIComponent(text)}${locationQuery}`,
        { responseType: "json" },
      );
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

  const selectResult = async (result: any) => {
    try {
      const details = Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lng))
        ? { lat: Number(result.lat), lng: Number(result.lng) }
        : await customFetch<{ lat: number, lng: number }>(`/places/details/${result.id}`);
      const completeData = {
        description: result.address,
        lat: details.lat,
        lng: details.lng,
        name: result.name
      };

      if (focusedInput?.type === 'pickup') {
        pickupRef.current?.setAddressText(result.address);
        handleSelection('pickup', completeData, null);
      } else if (focusedInput?.type === 'drop') {
        dropRef.current?.setAddressText(result.address);
        handleSelection('drop', completeData, null);
      } else if (focusedInput?.type === 'stop' && focusedInput.id) {
        handleStopSelection(focusedInput.id, completeData, null);
      }

      setSearchResults([]);
      setIsSearching(false);
      setSearchLoading(false);
      setSearchText("");
    } catch (e) {
      console.error("Selection error:", e);
    }
  };

  const handleSelection = async (type: 'pickup' | 'drop', data: any, details: any = null) => {
    const lat = details?.geometry?.location?.lat || data.lat;
    const lng = details?.geometry?.location?.lng || data.lng;
    const addrName = data.description || data.name;
    const placeId = data.place_id || data.id || details?.place_id;
    const placeName = data.structured_formatting?.main_text || data.name || addrName?.split(",")?.[0]?.trim();

    if (lat && lng) {
      try {
        const checkRes = await customFetch<any>(`/zones/check?lat=${lat}&lng=${lng}`);
        if (!checkRes || !checkRes.inZone) {
          Alert.alert("No Service", `No service at current ${type} location.`);
          if (type === 'pickup') {
            pickupRef.current?.setAddressText("");
            setPickup(null);
          } else {
            dropRef.current?.setAddressText("");
            setDrop(null);
          }
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

  const handleAddStop = () => {
    setStops([...stops, { id: Date.now().toString(), name: "", lat: 0, lng: 0 }]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter(s => s.id !== id));
  };

  const handleStopSelection = (id: string, data: any, details: any = null) => {
    const lat = details?.geometry?.location?.lat || data.lat;
    const lng = details?.geometry?.location?.lng || data.lng;
    const addrName = data.description || data.name;
    const placeId = data.place_id || data.id || details?.place_id;
    const placeName = data.structured_formatting?.main_text || data.name || addrName?.split(",")?.[0]?.trim();

    saveRecentPlace({
      id: placeId || addrName,
      name: placeName,
      address: addrName,
      lat,
      lng,
    });

    setStops(prev => prev.map(s => s.id === id ? { ...s, name: addrName, lat, lng } : s));
  };

  const selectSavedAddress = (addr: any) => {
    const lat = addr.coordinates?.lat ?? addr.location?.coordinates?.[1];
    const lng = addr.coordinates?.lng ?? addr.location?.coordinates?.[0];
    if (lat == null || lng == null) return;
    const data = { id: addr._id, name: addr.label, description: addr.addressLine, lat, lng };
    if (!pickup) {
      pickupRef.current?.setAddressText(addr.addressLine);
      handleSelection('pickup', data, null);
    } else {
      dropRef.current?.setAddressText(addr.addressLine);
      handleSelection('drop', data, null);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setFetchingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      // Check zone for current location
      try {
        const checkRes = await customFetch<any>(`/zones/check?lat=${location.coords.latitude}&lng=${location.coords.longitude}`);
        if (!checkRes || !checkRes.inZone) {
          Alert.alert("No Service", "No service at current pickup location.");
          pickupRef.current?.setAddressText("");
          setPickup(null);
          return;
        }
      } catch (err) {
        console.error("Zone check failed:", err);
      }

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        const displayAddr = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`.trim();
        pickupRef.current?.setAddressText(displayAddr);
        const newPickup = {
          name: displayAddr,
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        setPickup(newPickup);

        if (drop) {
          router.push({
            pathname: "/ride-confirmation",
            params: {
              serviceId,
              pickupName: displayAddr,
              dropName: drop.name,
              pickupLat: newPickup.lat.toString(),
              pickupLng: newPickup.lng.toString(),
              dropLat: drop.lat.toString(),
              dropLng: drop.lng.toString(),
              stops: JSON.stringify(stops),
              bookingForType: bookingFor,
              riderContact: someoneContact,
            }
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setFetchingLocation(false);
    }
  };

  return (
    <>
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.root}
    >
      <DropLocationHeader
        bookingFor={bookingFor}
        insets={insets}
        name={name}
        setShowBookingForSheet={setShowBookingForSheet}
        styles={styles}
        tokens={tokens}
      />

      <RouteInputCard
        accent={accent}
        drop={drop}
        dropRef={dropRef}
        fetchingLocation={fetchingLocation}
        handleCurrentLocation={handleCurrentLocation}
        handleRemoveStop={handleRemoveStop}
        handleSearch={handleSearch}
        handleSelection={handleSelection}
        handleStopSelection={handleStopSelection}
        pickup={pickup}
        pickupRef={pickupRef}
        setFocusedInput={setFocusedInput}
        stops={stops}
        styles={styles}
        tokens={tokens}
      />

      <DropActionRow
        serviceId={serviceId}
        drop={drop}
        handleAddStop={handleAddStop}
        pickup={pickup}
        styles={styles}
        tokens={tokens}
      />

      <PlacesList
        drop={drop}
        dropRef={dropRef}
        handleSelection={handleSelection}
        isSearching={isSearching}
        pickup={pickup}
        pickupRef={pickupRef}
        recentPlaces={recentPlaces}
        savedAddresses={savedAddresses}
        searchError={searchError}
        searchLoading={searchLoading}
        searchResults={searchResults}
        searchText={searchText}
        selectResult={selectResult}
        selectSavedAddress={selectSavedAddress}
        styles={styles}
        tokens={tokens}
      />

      {isNavigating && (
        <DropLocationLoadingOverlay
          accent={accent}
          styles={styles}
        />
      )}
    </KeyboardAvoidingView>

    <Modal
      visible={showBookingForSheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBookingForSheet(false)}
    >
      <BookingForSheet
        user={user}
        accent={accent}
        bookingFor={bookingFor}
        insets={insets}
        savingPreference={savingPreference}
        setBookingFor={setBookingFor}
        setSavingPreference={setSavingPreference}
        setShowBookingForSheet={setShowBookingForSheet}
        setSomeoneContact={setSomeoneContact}
        someoneContact={someoneContact}
        styles={styles}
        tokens={tokens}
      />
    </Modal>
    </>
  );
}
