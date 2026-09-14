import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { type ServiceTokens } from "@/constants/colors";
import { cuisineImageUrl } from "./CuisineStrip.images";

// Moved out of app/(tabs)/index.tsx. The circles now show a real photo of the
// cuisine instead of an emoji — see CuisineStrip.images.ts for the mapping.

interface Props {
  styles: any;
  activeService: string;
  cuisineChips: string[];
  selectedCuisines: string[];
  setSelectedCuisines: (next: string[]) => void;
  accent: ServiceTokens;
}

export function CuisineStrip({
  styles,
  activeService,
  cuisineChips,
  selectedCuisines,
  setSelectedCuisines,
  accent,
}: Props) {
  return (
    <View style={styles.cuisineSection}>
      {activeService === "Food" && <Text style={styles.cuisineLabel}>Browse by cuisine</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineScrollContent}>
        {cuisineChips.map((cuisine) => {
          const isSelected = selectedCuisines.includes(cuisine);
          return (
            <TouchableOpacity
              key={cuisine}
              style={styles.cuisineItem}
              activeOpacity={0.8}
              onPress={() => setSelectedCuisines(isSelected ? selectedCuisines.filter((c) => c !== cuisine) : [...selectedCuisines, cuisine])}
            >
              <View style={[styles.cuisineCircle, isSelected && { borderColor: accent.accent, borderWidth: 2 }]}>
                <Image
                  source={{ uri: cuisineImageUrl(cuisine) }}
                  style={styles.cuisineImage}
                  contentFit="cover"
                  transition={200}
                />
              </View>
              <Text style={[styles.cuisineName, isSelected && { color: accent.accent }]}>{cuisine}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
