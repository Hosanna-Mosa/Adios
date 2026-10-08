import { Text } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInDown } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type FavoritesStyles } from "@/features/food/useFavorites";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: EdgeInsets;
  styles: FavoritesStyles;
  tokens: ThemeTokens;
}

export function FavoritesHeaderRow({
  insets,
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View style={[styles.headerRow, { paddingTop: insets.top + 4 }]} entering={fadeInDown(0)}>
      <TouchableOpacity style={styles.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profile"))}>
        <Ionicons name="chevron-back" size={moderateScale(22)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Favorites</Text>
    </Animated.View>
  );
}
