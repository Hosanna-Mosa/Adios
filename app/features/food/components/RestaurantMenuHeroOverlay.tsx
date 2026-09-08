import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/restaurant-menu.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  id: any;
  insets: any;
  isFavorite: any;
  name: any;
  setScrolledPast: any;
  styles: any;
  toggleFavorite: any;
}

export function RestaurantMenuHeroOverlay({
  accent,
  id,
  insets,
  isFavorite,
  name,
  setScrolledPast,
  styles,
  toggleFavorite,
}: Props) {
  return (
    <View style={[styles.heroOverlay, { top: insets.top + 10 }]}>
      <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color="#fff" />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => toggleFavorite(id as string)}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={moderateScale(18)} color={isFavorite ? accent.accent : "#fff"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn} onPress={() => setScrolledPast(true)}>
          <Ionicons name="search" size={moderateScale(18)} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
