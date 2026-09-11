import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeFavoriteItems: any;
  activeFavorites: any;
  activeTab: any;
  setActiveTab: any;
  styles: any;
}

export function FavoritesSegmentWrap({
  activeFavoriteItems,
  activeFavorites,
  activeTab,
  setActiveTab,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.segmentWrap} entering={fadeInUp(60)}>
      <View style={styles.segmentTrack}>
        <View style={[styles.segmentThumb, activeTab === "items" && { left: "50%" }]} />
        <TouchableOpacity style={styles.segmentCell} onPress={() => setActiveTab("outlets")}>
          <Text style={[styles.segmentLabel, activeTab === "outlets" && styles.segmentLabelActive]}>Outlets · {activeFavorites.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.segmentCell} onPress={() => setActiveTab("items")}>
          <Text style={[styles.segmentLabel, activeTab === "items" && styles.segmentLabelActive]}>Items · {activeFavoriteItems.length}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
