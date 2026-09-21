import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { typography } from "@/constants/typography";
import { translateFoodTag } from "@/i18n/foodTagLabels";
import { type ServiceTokens } from "@/constants/colors";
import { type MeatStyles } from "@/features/meat/meat-centers.styles";

// Moved out of app/meat-centers.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  t: any;
  isActive: boolean;
  accent: ServiceTokens;
  setSelectedCategory: any;
  styles: MeatStyles;
}

export function MeatTypeChip({
  t,
  isActive,
  accent,
  setSelectedCategory,
  styles,
}: Props) {
  // `t` here is the meat-type object ({name, emoji}) — a pre-existing prop
  // name from before i18n, kept as-is to avoid touching the many call sites
  // that pass it. The translation function is aliased to `translate` instead.
  const { t: translate } = useTranslation();
  return (
    <TouchableOpacity
      style={styles.typeItem}
      onPress={() => setSelectedCategory(isActive ? null : t.name)}
    >
      <View style={[styles.typeCircle, isActive && styles.typeCircleActive]}>
        <Text style={{ fontSize: typography.sizes.extraLarge }}>{t.emoji}</Text>
      </View>
      <Text style={[styles.typeLabel, isActive && { color: accent.accent }]} numberOfLines={1}>
        {translateFoodTag(t.name, translate)}
      </Text>
    </TouchableOpacity>
  );
}
