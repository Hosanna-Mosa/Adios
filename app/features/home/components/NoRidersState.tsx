import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  handleUseCurrentLocation: () => void;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function NoRidersState({
  handleUseCurrentLocation,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.noServiceContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: tokens.warningSkin }]}>
        <Ionicons name="location-sharp" size={26} color={tokens.warning} />
      </View>
      <Text style={styles.noServiceTitle}>{t("app.home.noLocationSelected")}</Text>
      <Text style={styles.noServiceSubtitle}>{t("app.home.weNeedAnAddressToShow")}</Text>
      <TouchableOpacity style={styles.noServiceButton} onPress={handleUseCurrentLocation}>
        <Text style={styles.noServiceButtonText}>{t("app.home.useMyCurrentLocation")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.noServiceSecondaryButton} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.noServiceSecondaryButtonText}>{t("app.home.enterAddressManually")}</Text>
      </TouchableOpacity>
    </View>
  );
}
