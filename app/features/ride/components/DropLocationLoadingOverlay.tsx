import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type ServiceTokens } from "@/constants/colors";
import { type DropLocationStyles } from "@/features/ride/drop-location.styles";

// Moved out of app/drop-location.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  styles: DropLocationStyles;
}

export function DropLocationLoadingOverlay({
  accent,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={accent.accent} />
        <Text style={styles.loadingText}>{t("app.ride.fetchingRouteCalculatingFare")}</Text>
      </View>
    </View>
  );
}
