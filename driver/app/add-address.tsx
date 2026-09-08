import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import * as Location from "expo-location";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import {
  AddressFieldHeader,
  AddressLabelPicker,
  AddressSaveBar,
  AddressScreenHeader,
  AddressSuggestions,
  AddressTextField,
  CoordinateBanner,
} from "@/features/profile/components";
import { styles } from "@/features/profile/add-address.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";


const LABEL_OPTIONS = ["Home", "Work", "Other"];

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { token } = useDriverStore();

  const isEditMode = !!(params.editId && String(params.editId).length > 0);

  const [label, setLabel] = useState(String(params.label || "Home"));
  const [addressLine, setAddressLine] = useState(String(params.addressLine || ""));
  const [phone, setPhone] = useState(String(params.phone || ""));
  const [receiverName, setReceiverName] = useState(String(params.receiverName || ""));
  const [loading, setLoading] = useState(false);
  const [addressLat, setAddressLat] = useState<number | null>(params.lat ? Number(params.lat) : null);
  const [addressLng, setAddressLng] = useState<number | null>(params.lng ? Number(params.lng) : null);
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

  const handleSave = async () => {
    if (!addressLine.trim()) {
      Alert.alert("Missing information", "Please enter your address.");
      return;
    }

    try {
      setLoading(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body: any = {
        label,
        addressLine: addressLine.trim(),
      };
      if (phone.trim()) body.phone = phone.trim();
      if (receiverName.trim()) body.receiverName = receiverName.trim();
      if (isEditMode && params.editId) {
        body.editId = String(params.editId);
      }
      if (addressLat !== null && addressLng !== null) {
        body.coordinates = { lat: addressLat, lng: addressLng };
      } else if (params.lat && params.lng) {
        body.coordinates = { lat: Number(params.lat), lng: Number(params.lng) };
      }

      const res = await fetch(`${apiUrl}/users/addresses`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save address");
      }

      Alert.alert("Success", isEditMode ? "Address updated successfully!" : "Address saved successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <AddressScreenHeader
        title={isEditMode ? "Edit Address" : "Add New Address"}
        paddingTop={insets.top + (Platform.OS === "web" ? 20 : 0)}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <AddressLabelPicker options={LABEL_OPTIONS} selected={label} onSelect={setLabel} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>

          <View style={styles.inputGroup}>
            <AddressFieldHeader
              label="Full Address *"
              fetching={fetchingLoc}
              onUseCurrentLocation={handleGetCurrentLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. 12, MG Road, Koramangala, Bangalore"
              placeholderTextColor={Colors.textMuted}
              value={addressLine}
              onChangeText={(text) => {
                setAddressLine(text);
                fetchSuggestions(text);
              }}
              multiline
            />

            <AddressSuggestions
              suggestions={suggestions}
              onSelect={(item) => {
                setAddressLine(item.address);
                setAddressLat(item.lat);
                setAddressLng(item.lng);
                setSuggestions([]);
              }}
            />

            <CoordinateBanner lat={addressLat} lng={addressLng} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <AddressTextField
            label="Receiver&apos;s Name"
            placeholder="Enter receiver name"
            value={receiverName}
            onChangeText={setReceiverName}
          />
          <AddressTextField
            label="Phone Number"
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      <AddressSaveBar
        label={isEditMode ? "Update Address" : "Save Address"}
        loading={loading}
        onPress={handleSave}
        paddingBottom={insets.bottom + 16}
      />
    </KeyboardAvoidingView>
  );
}
