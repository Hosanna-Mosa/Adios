import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { AddressFormPaneSaveAsStreetAddress } from "./AddressFormPaneSaveAsStreetAddress";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type AddAddressStyles } from "@/features/delivery/add-address.styles";

// Section of AddressFormPane, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  PROVIDER_GOOGLE: any;
  PROVIDER_DEFAULT: any;
  MapView: any;
  accent: ServiceTokens;
  addressLine: any;
  completeAddress: any;
  handleSave: () => void;
  handleUseCurrentLocation: () => void;
  insets: EdgeInsets;
  instructions: any;
  isEditMode: boolean;
  isResolvingAddress: boolean;
  label: string;
  landmark: any;
  latLabel: string;
  lngLabel: string;
  loading: boolean;
  receiverName: string;
  receiverPhone: string;
  region: any;
  selectedChip: any;
  setAddressLine: React.Dispatch<React.SetStateAction<any>>;
  setCompleteAddress: React.Dispatch<React.SetStateAction<any>>;
  setInstructions: React.Dispatch<React.SetStateAction<any>>;
  setLabel: React.Dispatch<React.SetStateAction<any>>;
  setLandmark: React.Dispatch<React.SetStateAction<any>>;
  setReceiverName: React.Dispatch<React.SetStateAction<any>>;
  setReceiverPhone: React.Dispatch<React.SetStateAction<any>>;
  setSelectedChip: React.Dispatch<React.SetStateAction<any>>;
  setStep: React.Dispatch<React.SetStateAction<any>>;
  shortAddress: string;
  styles: AddAddressStyles;
  tokens: ThemeTokens;
}

export function AddressFormPaneSaveAs(props: Props) {
  const { MapView, PROVIDER_DEFAULT, PROVIDER_GOOGLE, accent, handleSave, insets, isEditMode, isResolvingAddress, label, latLabel, lngLabel, loading, region, selectedChip, setLabel, setSelectedChip, setStep, shortAddress, styles, tokens } = props;
  const { t } = useTranslation();
  return (
    <>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} keyboardShouldPersistTaps="handled">
      <Animated.View entering={fadeInUp(60)}>
        <TouchableOpacity style={styles.mapPreview} activeOpacity={0.9} onPress={() => setStep(1)}>
          <MapView provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT} style={StyleSheet.absoluteFill} region={region} scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false} />
          <View style={styles.mapPreviewPin}><Ionicons name="location" size={18} color="#fff" /></View>
          <View style={styles.mapPreviewPill}><Text style={styles.mapPreviewPillText} numberOfLines={1}>{isResolvingAddress ? t("app.delivery.confirmingLocation") : shortAddress || t("app.delivery.locationConfirmed")}</Text></View>
        </TouchableOpacity>
        <Text style={styles.mapPreviewCoords}>{t("app.delivery.lat")} {latLabel}  {t("app.delivery.lng")} {lngLabel}</Text>
      </Animated.View>

      <Animated.View style={styles.section} entering={fadeInUp(120)}>
        <Text style={styles.sectionLabel}>{t("app.delivery.saveAs")}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* "Home"/"Work"/"Other" are deliberately left untranslated: this is
              the address's `label` field, saved verbatim and later compared
              (e.g. LocationPickerSheet.tsx picks its icon by
              `item.label === "Home"`) — translating the chip text would
              silently break that matching for every address saved from here. */}
          {(["Home", "Work", "Other"] as const).map((chip, i) => {
            const isActive = selectedChip === chip;
            return (
              <Animated.View key={chip} entering={staggerListItem(i, 30)} style={{ flex: 1 }}>
                <TouchableOpacity style={[styles.chip, isActive && { backgroundColor: accent.skin, borderColor: accent.accent }]} onPress={() => setSelectedChip(chip)}>
                  <Text style={[styles.chipText, isActive && { color: accent.accent }]}>{chip}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        {selectedChip === "Other" && (
          <TextInput style={styles.customLabelInput} placeholder={t("app.delivery.customLabelEgFriendsHouse")} placeholderTextColor={tokens.muted} value={label} onChangeText={setLabel} />
        )}
      </Animated.View>

      <AddressFormPaneSaveAsStreetAddress {...props} />
    </ScrollView>

    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color={accent.on} /> : <Text style={styles.saveBtnText}>{isEditMode ? t("app.delivery.updateAddress") : t("app.delivery.saveAddress")}</Text>}
      </TouchableOpacity>
    </View>
    </>
  );
}
