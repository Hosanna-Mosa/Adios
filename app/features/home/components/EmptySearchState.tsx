import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  accent: ServiceTokens;
  searchText: string;
  styles: HomeStyles;
}

export function EmptySearchState({
  accent,
  searchText,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.emptySearchContainer}>
      <ActivityIndicator size="small" color={accent.accent} />
      <Text style={styles.emptySearchTitle}>{t("app.home.searching")}</Text>
      <Text style={styles.emptySearchSubtitle}>{t("app.home.lookingForVarAcrossNearbyMenus", { value: searchText.trim() })}</Text>
    </View>
  );
}
