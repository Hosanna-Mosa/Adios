import React, { useState, useEffect, useRef, useMemo } from "react";

import { AddressFormPane } from "@/features/delivery/components/AddressFormPane";
import { StyleSheet, View, TextInput, Platform, Alert } from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { customFetch } from "@/utils/api/custom-fetch";
import { useAuthStore } from "@/contexts/authStore";
import { useDeliveryStore, type SelectedDeliveryAddress } from "@/contexts/deliveryStore";
import * as Location from "expo-location";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "@/components/maps";
import { createStyles } from "@/features/delivery/add-address.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

import { AddAddressBottomCard } from "@/features/delivery/components/AddAddressBottomCard";
import { AddAddressCenterMarker } from "@/features/delivery/components/AddAddressCenterMarker";
import { AddAddressUseCurrentWrap } from "@/features/delivery/components/AddAddressUseCurrentWrap";
import { AddAddressSearchResults } from "@/features/delivery/components/AddAddressSearchResults";
import { AddAddressSearchRow } from "@/features/delivery/components/AddAddressSearchRow";
import { ScreenShell } from "@/components/ui/ScreenShell";

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);

  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const { user, setUser } = useAuthStore();
  const isEditMode = !!(params.editId && String(params.editId).length > 0);

  const [selectedChip, setSelectedChip] = useState<"Home" | "Work" | "Other">("Home");
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  const [phone] = useState(String(params.phone || ""));
  const [receiverName, setReceiverName] = useState(String(params.receiverName || ""));
  const [receiverPhone, setReceiverPhone] = useState(String(params.receiverPhone || ""));
  const [landmark, setLandmark] = useState(String(params.landmark || ""));
  const [shortAddress, setShortAddress] = useState("Select location");
  const [cityOrCountry, setCityOrCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(params.step === "1" ? 1 : 2);
  const [region, setRegion] = useState({ latitude: 17.4447, longitude: 78.3498, latitudeDelta: 0.005, longitudeDelta: 0.005 });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const isMapReady = useRef(false);

  const latLabel = region.latitude.toFixed(6);
  const lngLabel = region.longitude.toFixed(6);

  const fetchAddressForCoords = async (lat: number, lng: number) => {
    try {
      setIsResolvingAddress(true);
      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (place) {
        const fullAddress = [place.name, place.streetNumber, place.street, place.city, place.region].filter(Boolean).join(", ");
        setAddressLine(fullAddress);
        setShortAddress(place.name || place.street || place.city || "Selected location");
        setCityOrCountry([place.city, place.region].filter(Boolean).join(", ") || "India");
      }
    } catch (error) {
      console.log("Reverse geocode failed", error);
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      await fetchAddressForCoords(latitude, longitude);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.lat && params.lng) {
      const pLat = Number(params.lat);
      const pLng = Number(params.lng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        setRegion({ latitude: pLat, longitude: pLng, latitudeDelta: 0.005, longitudeDelta: 0.005 });
      }
    }

    if (isEditMode) {
      const lbl = String(params.label || "");
      if (lbl === "Home" || lbl === "Work") {
        setSelectedChip(lbl);
      } else {
        setSelectedChip("Other");
        setLabel(lbl);
      }

      const fullAddr = String(params.addressLine || "");
      const matchInst = fullAddr.match(/\(Instructions: (.*?)\)/);
      if (matchInst) setInstructions(matchInst[1]);
      const cleanedFromInst = fullAddr.replace(/\s*\(Instructions:.*?\)/, "").trim();

      const matchApt = cleanedFromInst.match(/\[Apt: (.*?)\]/);
      if (matchApt) {
        setCompleteAddress(matchApt[1]);
        setAddressLine(cleanedFromInst.replace(/\s*\[Apt:.*?\]/, "").trim());
      } else {
        const commaIndex = cleanedFromInst.indexOf(",");
        if (commaIndex !== -1 && commaIndex < 15) {
          setCompleteAddress(cleanedFromInst.substring(0, commaIndex).trim());
          setAddressLine(cleanedFromInst.substring(commaIndex + 1).trim());
        } else {
          setAddressLine(cleanedFromInst);
        }
      }
    } else if (!params.lat) {
      handleUseCurrentLocation();
    }
  }, []);

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
        const results = await customFetch<any[]>(`/places/autocomplete?input=${encodeURIComponent(text)}${locQuery}`);
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

  const handleSelectSearchResult = async (item: any) => {
    try {
      const details = Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng))
        ? { lat: Number(item.lat), lng: Number(item.lng) }
        : await customFetch<any>(`/places/details/${item.id}`);
      const newRegion = { ...region, latitude: details.lat, longitude: details.lng };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      setSearchQuery("");
      setSearchResults([]);
      await fetchAddressForCoords(details.lat, details.lng);
    } catch (error) {
      console.error("Select place error:", error);
    }
  };

  const handleSave = async () => {
    if (!addressLine.trim()) {
      Alert.alert("Missing information", "Street address is required.");
      return;
    }
    const receiverPhoneDigits = receiverPhone.replace(/\D/g, "");
    if (receiverPhone.trim() && receiverPhoneDigits.length !== 10) {
      Alert.alert("Invalid phone", "Enter a valid 10-digit receiver phone number.");
      return;
    }
    try {
      setLoading(true);
      let finalAddress = addressLine.trim();
      if (completeAddress.trim()) finalAddress += ` [Apt: ${completeAddress.trim()}]`;
      if (instructions.trim()) finalAddress += ` (Instructions: ${instructions.trim()})`;
      const finalLabel = selectedChip === "Other" ? label.trim() || "Other" : selectedChip;
      // The address contact falls back to the receiver's number, then to whatever the
      // address already carried, then to the account holder's — never a fabricated one.
      const finalPhone = receiverPhoneDigits || phone || user?.phone || "";

      const payload = {
        label: finalLabel,
        addressLine: finalAddress,
        phone: finalPhone,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhoneDigits,
        landmark: landmark.trim(),
        coordinates: { lat: region.latitude, lng: region.longitude },
      };

      const updatedAddresses = isEditMode
        ? await customFetch<any[]>(`/users/addresses/${params.editId}`, { method: "PATCH", body: JSON.stringify(payload) })
        : await customFetch<any[]>("/users/addresses", { method: "POST", body: JSON.stringify(payload) });

      if (user) setUser({ ...user, addresses: updatedAddresses });

      if (isEditMode && !useDeliveryStore.getState().selectedAddress) {
        await useDeliveryStore.getState().hydrateSelectedAddress();
      }
      const list = updatedAddresses || [];
      const saved = isEditMode
        ? list.find((a: any) => String(a._id) === String(params.editId))
        : list[list.length - 1];
      const { selectedAddress, setSelectedAddress } = useDeliveryStore.getState();
      // A brand new address becomes the active one; an edit only re-selects the
      // address that was already active, so editing an unrelated one cannot move
      // the delivery location out from under the customer.
      const shouldSelect = saved && (!isEditMode || String(selectedAddress?._id || "") === String(saved._id));
      if (shouldSelect) {
        const next: SelectedDeliveryAddress = {
          _id: saved._id,
          label: saved.label,
          addressLine: saved.addressLine,
          phone: saved.phone,
          receiverName: saved.receiverName,
          receiverPhone: saved.receiverPhone,
          landmark: saved.landmark,
          coordinates: { lat: region.latitude, lng: region.longitude },
          location: { type: "Point", coordinates: [region.longitude, region.latitude] },
        };
        setSelectedAddress(next);
      }

      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell keyboardAvoiding>
      {step === 1 ? (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFill}
            initialRegion={region}
            onRegionChangeComplete={onRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton={false}
          />

          <AddAddressSearchRow
            accent={accent}
            handleSearch={handleSearch}
            insets={insets}
            router={router}
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
            searching={searching}
            styles={styles}
            tokens={tokens}
          />

          {searchResults.length > 0 && (
            <AddAddressSearchResults
              handleSelectSearchResult={handleSelectSearchResult}
              insets={insets}
              searchResults={searchResults}
              styles={styles}
            />
          )}

          <AddAddressUseCurrentWrap
            accent={accent}
            handleUseCurrentLocation={handleUseCurrentLocation}
            styles={styles}
          />

          <AddAddressCenterMarker
            isResolvingAddress={isResolvingAddress}
            styles={styles}
            tokens={tokens}
          />

          <AddAddressBottomCard
            accent={accent}
            cityOrCountry={cityOrCountry}
            insets={insets}
            isResolvingAddress={isResolvingAddress}
            latLabel={latLabel}
            lngLabel={lngLabel}
            searchInputRef={searchInputRef}
            setStep={setStep}
            shortAddress={shortAddress}
            styles={styles}
          />
        </View>
      ) : (
        <AddressFormPane
          MapView={MapView}
          PROVIDER_DEFAULT={PROVIDER_DEFAULT}
          PROVIDER_GOOGLE={PROVIDER_GOOGLE}
          accent={accent}
          addressLine={addressLine}
          completeAddress={completeAddress}
          handleSave={handleSave}
          handleUseCurrentLocation={handleUseCurrentLocation}
          insets={insets}
          instructions={instructions}
          isEditMode={isEditMode}
          isResolvingAddress={isResolvingAddress}
          label={label}
          landmark={landmark}
          latLabel={latLabel}
          lngLabel={lngLabel}
          loading={loading}
          receiverName={receiverName}
          receiverPhone={receiverPhone}
          region={region}
          router={router}
          selectedChip={selectedChip}
          setAddressLine={setAddressLine}
          setCompleteAddress={setCompleteAddress}
          setInstructions={setInstructions}
          setLabel={setLabel}
          setLandmark={setLandmark}
          setReceiverName={setReceiverName}
          setReceiverPhone={setReceiverPhone}
          setSelectedChip={setSelectedChip}
          setStep={setStep}
          shortAddress={shortAddress}
          styles={styles}
          tokens={tokens}
        />
      )}
    </ScreenShell>
  );
}
