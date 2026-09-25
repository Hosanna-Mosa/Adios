import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";
import { type FavoritesStyles } from "@/features/food/useFavorites";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  styles: FavoritesStyles;
}

export function NoFavoriteDishesState({
  accent,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.emptyContainer} entering={fadeInUp(0)}>
      <View style={styles.heartCircle}>
        <Ionicons name="heart-outline" size={moderateScale(28)} color={accent.accent} />
      </View>
      <Text style={styles.emptyTitle}>{t("app.food.noFavoriteDishesYet")}</Text>
      <Text style={styles.emptySubtitle}>{t("app.food.tapTheHeartOnAnyDish")}</Text>
    </Animated.View>
  );
}
