import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/delivery/saved-addresses.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  addresses: any;
  currentLocLoading: any;
  handleUseCurrentLocation: any;
  styles: any;
}

export function SavedAddressesEmptyWrap({
  accent,
  addresses,
  currentLocLoading,
  handleUseCurrentLocation,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="location" size={moderateScale(28)} color={accent.accent} />
      </View>
      <Text style={styles.emptyTitle}>{t("app.delivery.noSavedPlaces")}</Text>
      <Text style={styles.emptySubtitle}>
        {t("app.delivery.saveTheAddressesYouUseOften")}
      </Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/delivery/add-address")}>
        <Text style={styles.primaryBtnText}>{t("app.delivery.addYourFirstAddress")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={handleUseCurrentLocation} disabled={currentLocLoading}>
        {currentLocLoading ? <ActivityIndicator size="small" color={accent.accent} /> : <Text style={styles.secondaryBtnText}>{t("app.LocationPickerSheet.useCurrentLocation")}</Text>}
      </TouchableOpacity>
    </View>
  );
}
