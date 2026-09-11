import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to
// read from the screen's scope is now passed in as props. CUISINE_EMOJI came
// with it because nothing else referenced it.

const CUISINE_EMOJI: { [key: string]: string } = {
  Biryani: "🍛", Tiffins: "🫓", Chinese: "🍜", Pizza: "🍕", Sweets: "🍮",
  "South Indian": "🥞", "North Indian": "🍛", Mughlai: "🍢", Kebabs: "🍢",
  "Fast Food": "🍔", Burgers: "🍔", Rolls: "🌯", Desserts: "🍮",
  Chicken: "🐔", Mutton: "🐐", Seafood: "🦐", Eggs: "🥚",
};

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
                <Text style={styles.cuisineEmoji}>{CUISINE_EMOJI[cuisine] || "🍽️"}</Text>
              </View>
              <Text style={[styles.cuisineName, isSelected && { color: accent.accent }]}>{cuisine}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
