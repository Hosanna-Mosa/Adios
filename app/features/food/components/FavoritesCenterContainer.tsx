import { ActivityIndicator, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";
import { type FavoritesStyles } from "@/features/food/useFavorites";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  styles: FavoritesStyles;
}

export function FavoritesCenterContainer({
  accent,
  styles,
}: Props) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={accent.accent} />
    </View>
  );
}
