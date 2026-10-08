import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type RestaurantMenuStyles } from "@/features/food/restaurant-menu.styles";

// Moved out of app/restaurant-menu.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  id: string | string[];
  insets: EdgeInsets;
  isFavorite: boolean;
  name: string | string[];
  styles: RestaurantMenuStyles;
  toggleFavorite: any;
  tokens: ThemeTokens;
}

export function RestaurantMenuSolidHeader({
  accent,
  id,
  insets,
  isFavorite,
  name,
  styles,
  toggleFavorite,
  tokens,
}: Props) {
  return (
    <View style={[styles.solidHeader, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.solidHeaderBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.solidHeaderTitle} numberOfLines={1}>{name}</Text>
      <TouchableOpacity style={styles.solidHeaderBtn} onPress={() => toggleFavorite(id as string)}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={moderateScale(18)} color={isFavorite ? accent.accent : tokens.text} />
      </TouchableOpacity>
    </View>
  );
}
