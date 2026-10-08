import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { type ServiceTokens } from "@/constants/colors";
import { translateFoodTag } from "@/i18n/foodTagLabels";
import { type HomeStyles } from "@/features/home/home.styles";
import { cuisineImageUrl } from "./CuisineStrip.images";

// Moved out of app/(tabs)/index.tsx. The circles now show a real photo of the
// cuisine instead of an emoji — see CuisineStrip.images.ts for the mapping.
//
// The cuisine strings passed to cuisineImageUrl() are never translated: they're
// matched against live cuisine tags that can come from the backend (real vendor
// data), so the lookup keys have to stay in English. Only the visible chip text
// (below) is translated, via the shared translateFoodTag() helper, which falls
// back to the raw string for any cuisine word outside its known vocabulary —
// see ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11.

interface Props {
  styles: HomeStyles;
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
                <Image
                  source={{ uri: cuisineImageUrl(cuisine) }}
                  style={styles.cuisineImage}
                  contentFit="cover"
                  transition={200}
                />
              </View>
              <Text style={[styles.cuisineName, isSelected && { color: accent.accent }]}>{translateFoodTag(cuisine, t)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
