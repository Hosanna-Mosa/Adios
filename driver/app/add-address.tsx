import { router } from "expo-router";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        title={isEditMode ? t("profile.editAddress") : t("profile.addNewAddress")}
        paddingTop={insets.top + (Platform.OS === "web" ? 20 : 0)}
        onBack={() => router.back()}
      />

      <ScrollBox
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <AddressLabelPicker options={LABEL_OPTIONS} selected={label} onSelect={setLabel} />

        <AddressSection title={t("profile.addressDetails")}>

          <Box style={styles.inputGroup}>
            <AddressFieldHeader
              label={t("profile.fullAddress")}
              fetching={fetchingLoc}
              onUseCurrentLocation={handleGetCurrentLocation}
            />
            <AppTextInput
              style={styles.input}
              placeholder={t("profile.egFullAddress")}
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

        <AddressSection title={t("profile.contactDetails")}>
          <AddressTextField
            label={t("profile.receiversName")}
            placeholder={t("profile.enterReceiverName")}
            value={receiverName}
            onChangeText={setReceiverName}
          />
          <AddressTextField
            label={t("profile.phoneNumber")}
            placeholder={t("profile.enterPhoneNumber")}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </AddressSection>
      </ScrollBox>

      <AddressSaveBar
        label={isEditMode ? t("profile.updateAddress") : t("profile.saveAddress")}
        loading={loading}
        onPress={handleSave}
        paddingBottom={insets.bottom + 16}
      />
    </KeyboardView>
  );
}
