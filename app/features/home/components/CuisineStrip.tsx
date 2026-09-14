import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type ServiceTokens } from "@/constants/colors";
import { translateFoodTag } from "@/i18n/foodTagLabels";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to
// read from the screen's scope is now passed in as props. CUISINE_EMOJI came
// with it because nothing else referenced it.
//
// CUISINE_EMOJI's keys are never translated: they're a lookup table matched
// against live cuisine tags that can come from the backend (real vendor
// data), so the keys have to stay in English for the lookup to keep working.
// Only the visible chip text (below) is translated, via the shared
// translateFoodTag() helper, which falls back to the raw string for any
// cuisine word outside its known vocabulary — see
// ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11.
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
  const { t } = useTranslation();
  return (
    <View style={styles.cuisineSection}>
      {activeService === "Food" && <Text style={styles.cuisineLabel}>{t("app.home.browseByCuisine")}</Text>}
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
              <Text style={[styles.cuisineName, isSelected && { color: accent.accent }]}>{translateFoodTag(cuisine, t)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
