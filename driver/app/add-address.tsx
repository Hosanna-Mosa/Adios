import { router } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import {
  AddressFieldHeader,
  AddressLabelPicker,
  AddressSaveBar,
  AddressSection,
  AddressSuggestions,
  AddressTextField,
  CoordinateBanner,
} from "@/features/profile/components";
import { useAddressForm } from "@/features/profile/hooks/useAddressForm";
import { styles } from "@/features/profile/add-address.styles";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { KeyboardView } from "@/components/ui/KeyboardView";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";

const LABEL_OPTIONS = ["Home", "Work", "Other"];

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const {
    isEditMode,
    label, setLabel,
    addressLine, setAddressLine,
    phone, setPhone,
    receiverName, setReceiverName,
    loading,
    addressLat, setAddressLat,
    addressLng, setAddressLng,
    fetchingLoc,
    suggestions, setSuggestions,
    fetchSuggestions,
    handleGetCurrentLocation,
    handleSave,
  } = useAddressForm();

  return (
    <KeyboardView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScreenHeader
        title={isEditMode ? "Edit Address" : "Add New Address"}
        paddingTop={insets.top + (Platform.OS === "web" ? 20 : 0)}
        onBack={() => router.back()}
      />

      <ScrollBox
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <AddressLabelPicker options={LABEL_OPTIONS} selected={label} onSelect={setLabel} />

        <AddressSection title="Address Details">

          <Box style={styles.inputGroup}>
            <AddressFieldHeader
              label="Full Address *"
              fetching={fetchingLoc}
              onUseCurrentLocation={handleGetCurrentLocation}
            />
            <AppTextInput
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
          </Box>
        </AddressSection>

        <AddressSection title="Contact Details">
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
        </AddressSection>
      </ScrollBox>

      <AddressSaveBar
        label={isEditMode ? "Update Address" : "Save Address"}
        loading={loading}
        onPress={handleSave}
        paddingBottom={insets.bottom + 16}
      />
    </KeyboardView>
  );
}
