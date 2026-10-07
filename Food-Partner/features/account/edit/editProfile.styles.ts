import { StyleSheet } from "react-native";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/edit-profile.tsx. Cards are ui/Card, fields ui/TextField.
export const createEditStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 },
    card: { gap: 16 },
    field: { gap: 10 },
    label: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.muted },
    prefix: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.muted },
    location: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.sunken,
      padding: 12,
    },
    locationTexts: { flex: 1, gap: 2 },
    locationAddress: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.text },
    locationCoords: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.muted },
  });

export type EditProfileStyles = ReturnType<typeof createEditStyles>;
