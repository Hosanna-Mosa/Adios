import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInDown } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: any;
  styles: any;
  tokens: any;
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
