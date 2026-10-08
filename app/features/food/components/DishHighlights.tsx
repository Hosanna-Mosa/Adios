import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Small dish extras shown on the menu row and in the dish detail sheet: the
// "Bestseller" badge (isBestseller from GET /food/vendor/:id) and the
// "320 kcal · 18g protein" line when the outlet filled those in.

export function BestsellerBadge({ tokens, style }: { tokens: ThemeTokens; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.badge, { backgroundColor: tokens.warningSkin }, style]}>
      <Ionicons name="star" size={moderateScale(10)} color={tokens.warning} />
      <Text style={[styles.badgeText, { color: tokens.warning }]}>{t("app.food.bestseller")}</Text>
    </View>
  );
}

const isAmount = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;

/** "320 kcal · 18g protein", or null when neither value is set. */
export function NutritionLine({ calories, protein, tokens, style }: {
  calories?: number | null;
  protein?: number | null;
  tokens: ThemeTokens;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  const parts: string[] = [];
  if (isAmount(calories)) parts.push(t("app.food.kcal", { value: Math.round(calories) }));
  if (isAmount(protein)) parts.push(t("app.food.proteinGrams", { value: Math.round(protein * 10) / 10 }));
  if (parts.length === 0) return null;
  return (
    <View style={[styles.nutritionRow, style]}>
      <Ionicons name="flame-outline" size={moderateScale(12)} color={tokens.sec} />
      <Text style={[styles.nutritionText, { color: tokens.sec }]}>{parts.join(" · ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4,
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small },
  nutritionRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  nutritionText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small },
});
