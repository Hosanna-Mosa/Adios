import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type FavoritesStyles } from "@/features/food/useFavorites";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeFavoriteItems: any;
  activeFavorites: any;
  activeTab: any;
  setActiveTab: any;
  styles: FavoritesStyles;
}

export function FavoritesSegmentWrap({
  activeFavoriteItems,
  activeFavorites,
  activeTab,
  setActiveTab,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.segmentWrap} entering={fadeInUp(60)}>
      <View style={styles.segmentTrack}>
        <View style={[styles.segmentThumb, activeTab === "items" && { left: "50%" }]} />
        <TouchableOpacity style={styles.segmentCell} onPress={() => setActiveTab("outlets")}>
          <Text style={[styles.segmentLabel, activeTab === "outlets" && styles.segmentLabelActive]}>{t("app.food.outlets")} {activeFavorites.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.segmentCell} onPress={() => setActiveTab("items")}>
          <Text style={[styles.segmentLabel, activeTab === "items" && styles.segmentLabelActive]}>{t("app.food.items")} {activeFavoriteItems.length}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
