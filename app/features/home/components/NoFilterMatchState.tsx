import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeFilterCount: number;
  clearAllFilters: () => void;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function NoFilterMatchState({
  activeFilterCount,
  clearAllFilters,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.noServiceContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="funnel-outline" size={26} color={tokens.sec} />
      </View>
      <Text style={styles.noServiceTitle}>{t("app.home.noOutletsMatchYourFilters")}</Text>
      <Text style={styles.noServiceSubtitle}>
        {t("app.home.nothingNearbyClearsTheFilterCount", { count: activeFilterCount })}
      </Text>
      <TouchableOpacity style={styles.noServiceButton} onPress={clearAllFilters}>
        <Text style={styles.noServiceButtonText}>{t("app.home.clearFilters")}</Text>
      </TouchableOpacity>
    </View>
  );
}
