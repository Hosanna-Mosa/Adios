import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ServiceTokens } from "@/constants/colors";
import { type SavedAddressesStyles } from "@/features/delivery/saved-addresses.styles";

// Moved out of app/delivery/saved-addresses.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  currentLocLoading: any;
  handleUseCurrentLocation: () => void;
  selectingId: any;
  styles: SavedAddressesStyles;
}

export function SavedAddressRow({
  accent,
  currentLocLoading,
  handleUseCurrentLocation,
  selectingId,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/delivery/add-address")} disabled={selectingId !== null}>
        <Text style={styles.addBtnText}>{t("app.delivery.addNewAddress")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.currentLocRow} onPress={handleUseCurrentLocation} disabled={selectingId !== null || currentLocLoading}>
        {currentLocLoading ? <ActivityIndicator size="small" color={accent.accent} /> : <Ionicons name="locate" size={15} color={accent.accent} />}
        <Text style={styles.currentLocText}>{currentLocLoading ? t("app.delivery.fetchingLocation") : t("app.LocationPickerSheet.useCurrentLocation")}</Text>
      </TouchableOpacity>
    </View>
  );
}
