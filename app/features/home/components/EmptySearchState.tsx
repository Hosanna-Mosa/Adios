import { ActivityIndicator, Text, View } from "react-native";
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
  return (
    <View style={styles.emptySearchContainer}>
      <ActivityIndicator size="small" color={accent.accent} />
      <Text style={styles.emptySearchTitle}>Searching…</Text>
      <Text style={styles.emptySearchSubtitle}>Looking for &quot;{searchText.trim()}&quot; across nearby menus.</Text>
    </View>
  );
}
