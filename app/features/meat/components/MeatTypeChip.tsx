import { Text, TouchableOpacity, View } from "react-native";
import { typography } from "@/constants/typography";

// Moved out of app/meat-centers.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  t: any;
  isActive: any;
  accent: any;
  setSelectedCategory: any;
  styles: any;
}

export function MeatTypeChip({
  t,
  isActive,
  accent,
  setSelectedCategory,
  styles,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.typeItem}
      onPress={() => setSelectedCategory(isActive ? null : t.name)}
    >
      <View style={[styles.typeCircle, isActive && styles.typeCircleActive]}>
        <Text style={{ fontSize: typography.sizes.extraLarge }}>{t.emoji}</Text>
      </View>
      <Text style={[styles.typeLabel, isActive && { color: accent.accent }]} numberOfLines={1}>
        {t.name}
      </Text>
    </TouchableOpacity>
  );
}
