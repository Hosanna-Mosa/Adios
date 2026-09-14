import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  serviceName: any;
  styles: any;
  tokens: any;
}

export function HomeNoServiceContainer2({
  serviceName,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.noServiceContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="map-outline" size={26} color={tokens.sec} />
      </View>
      <Text style={styles.noServiceTitle}>{t("app.home.servicesArenapostAvailableInThisLocation")}</Text>
      <Text style={styles.noServiceSubtitle}>{t("app.home.weDonapostHave")} {serviceName} {t("app.home.outletsOrDeliveryServicesHereYet")}</Text>
      <TouchableOpacity style={styles.noServiceButton} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.noServiceButtonText}>{t("app.home.changeLocation")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.noServiceSecondaryButton}
        onPress={() => Alert.alert(t("app.home.thanks"), t("app.home.wellNotifyYouWhenWeLaunch"))}
      >
        <Text style={styles.noServiceSecondaryButtonText}>{t("app.home.notifyMeWhenYouLaunch")}</Text>
      </TouchableOpacity>
    </View>
  );
}
