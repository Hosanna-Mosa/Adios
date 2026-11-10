import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, type ServiceTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { translateFoodTag } from "@/i18n/foodTagLabels";
import { type HomeStyles } from "../home.styles";
import { cuisineImageUrl } from "./CuisineStrip.images";
import { CuisinesSheet } from "./CuisinesSheet";

// Moved out of app/(tabs)/index.tsx. The circles now show a real photo of the
// cuisine instead of an emoji — see CuisineStrip.images.ts for the mapping.
//
// The cuisine strings passed to cuisineImageUrl() are never translated: they're
// matched against live cuisine tags that can come from the backend (real vendor
// data), so the lookup keys have to stay in English. Only the visible chip text
// (below) is translated, via the shared translateFoodTag() helper, which falls
// back to the raw string for any cuisine word outside its known vocabulary —
// see ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11.
//
// The strip shows the first few cuisines, then an "All" tile that opens the full grid.

const STRIP_COUNT = 8;

interface Props {
  styles: HomeStyles;
  activeService: string;
  /** Every cuisine on offer; the strip shows the first few and "All" shows the rest. */
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
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const insets = useSafeAreaInsets();
  const [allOpen, setAllOpen] = useState(false);
  const shown = cuisineChips.slice(0, STRIP_COUNT);
  const title = activeService === "Meat" ? t("app.home.meatTypes", "Meat types") : t("app.home.cuisinesAndDishes", "Cuisines and dishes");

  return (
    <View style={styles.cuisineSection}>
      {activeService === "Food" && <Text style={styles.cuisineLabel}>{t("app.home.browseByCuisine")}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineScrollContent}>
        {shown.map((cuisine) => {
          const isSelected = selectedCuisines.includes(cuisine);
          return (
            <TouchableOpacity
              key={cuisine}
              style={styles.cuisineItem}
              activeOpacity={0.8}
              // One cuisine at a time: picking another replaces it; tapping it again clears it.
              onPress={() => setSelectedCuisines(isSelected ? [] : [cuisine])}
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

        {/* Last in the row: every cuisine in one grid. */}
        <TouchableOpacity
          style={styles.cuisineItem}
          activeOpacity={0.8}
          onPress={() => setAllOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t("app.home.allCuisines", "All cuisines")}
        >
          <View style={[styles.cuisineCircle, { backgroundColor: tokens.brandSkin }]}>
            <Ionicons name="grid-outline" size={moderateScale(24)} color={accent.accent} />
          </View>
          <Text style={[styles.cuisineName, { color: accent.accent }]}>{t("app.home.all", "All")}</Text>
        </TouchableOpacity>
      </ScrollView>

      <CuisinesSheet
        visible={allOpen}
        onClose={() => setAllOpen(false)}
        cuisines={cuisineChips}
        selectedCuisines={selectedCuisines}
        setSelectedCuisines={setSelectedCuisines}
        tokens={tokens}
        accent={accent}
        insets={insets}
        title={title}
      />
    </View>
  );
}
