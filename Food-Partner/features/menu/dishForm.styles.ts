import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/dish-form.tsx. Cards are ui/Card, fields ui/TextField,
// choices ui/Chip, photos ui/ImageTile + ui/ActionTile.
export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 },
    card: { gap: 16 },
    field: { gap: 10 },
    label: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    labelRow: { flexDirection: "row", justifyContent: "space-between" },
    counter: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.muted },
    photos: { gap: 10 },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.muted },
    error: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.error },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    offerHint: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.success },
    row: { flexDirection: "row", gap: 12 },
    half: { flex: 1 },
    switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    switchTexts: { flex: 1, gap: 2 },
    switchTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    unit: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted },
    rupee: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.muted },
  });

export type DishFormStyles = ReturnType<typeof createStyles>;
