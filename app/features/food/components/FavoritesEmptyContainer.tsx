import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  styles: any;
}

export function FavoritesEmptyContainer({
  accent,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.emptyContainer} entering={fadeInUp(0)}>
      <View style={styles.heartCircle}>
        <Ionicons name="heart-outline" size={moderateScale(28)} color={accent.accent} />
      </View>
      <Text style={styles.emptyTitle}>No favorite dishes yet</Text>
      <Text style={styles.emptySubtitle}>Tap the heart on any dish and it lands here.</Text>
    </Animated.View>
  );
}
