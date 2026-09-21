import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  checkNearbyDrivers: any;
  getCoords: any;
  isRetryingDrivers: boolean;
  setIsRetryingDrivers: any;
  styles: HomeStyles;
}

export function NoRidersNearbyState({
  accent,
  checkNearbyDrivers,
  getCoords,
  isRetryingDrivers,
  setIsRetryingDrivers,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.noServiceContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: accent.skin }]}>
        <Ionicons name="bicycle-outline" size={26} color={accent.accent} />
      </View>
      <Text style={styles.noServiceTitle}>{t("app.home.noRidersAvailableNearby")}</Text>
      <Text style={styles.noServiceSubtitle}>{t("app.home.allCaptainsNearbyAreOnTrips")}</Text>
      <TouchableOpacity
        style={[styles.noServiceButton, isRetryingDrivers && styles.noServiceButtonDisabled]}
        disabled={isRetryingDrivers}
        onPress={async () => {
          setIsRetryingDrivers(true);
          try {
            const { lat, lng } = await getCoords();
            if (lat && lng) await checkNearbyDrivers(lat, lng, { silent: true });
          } finally {
            setIsRetryingDrivers(false);
          }
        }}
      >
        {isRetryingDrivers ? (
          <ActivityIndicator size="small" color={accent.on} />
        ) : (
          <Text style={styles.noServiceButtonText}>{t("app.home.retrySearch")}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.noServiceSecondaryButton} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.noServiceSecondaryButtonText}>{t("app.home.changeLocation")}</Text>
      </TouchableOpacity>
    </View>
  );
}
