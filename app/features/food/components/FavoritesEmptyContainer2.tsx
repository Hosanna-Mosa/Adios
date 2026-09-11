import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { Button } from "@/components/ui/Button";

// Moved out of app/favorites.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  favorites: any;
  popularNearby: any[];
  styles: any;
}

export function FavoritesEmptyContainer2({
  accent,
  favorites,
  popularNearby,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.emptyContainer} entering={fadeInUp(0)}>
      <View style={styles.heartCircle}>
        <Ionicons name="heart" size={moderateScale(28)} color={accent.accent} />
      </View>
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart on any outlet and it lands here — across food, meat, and everything else.
      </Text>
      <Button title="Explore outlets" onPress={() => router.replace("/(tabs)")} fullWidth />

      {popularNearby.length > 0 && (
        <View style={styles.popularSection}>
          <Text style={styles.popularLabel}>Popular near you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {popularNearby.map((r, index) => (
              <Animated.View key={r._id} entering={staggerListItem(index)}>
                <TouchableOpacity
                  style={styles.popularCard}
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: "/restaurant-menu", params: { id: r._id, name: r.name, image: r.image || "" } })}
                >
                  <Image source={{ uri: r.image }} style={styles.popularImage} contentFit="cover" transition={200} />
                  <Text style={styles.popularName} numberOfLines={1}>{r.name}</Text>
                  <Text style={styles.popularMeta} numberOfLines={1}>
                    {[r.rating ? `${r.rating} ★` : "New", r.time].filter(Boolean).join(" · ")}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
}
