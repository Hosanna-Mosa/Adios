import { StyleSheet } from "react-native";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for the dish form's "Preview" sheet (DishPreviewSheet).
export const createPreviewStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    scroll: { maxHeight: 460, marginTop: 14 },
    body: { gap: 8, paddingBottom: 4 },
    imageWrap: {
      height: 170,
      borderRadius: radius.md,
      overflow: "hidden",
      backgroundColor: tokens.sunken,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    image: { width: "100%", height: "100%" },
    badgeOverlay: { position: "absolute", top: 10, left: 10 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    name: { flex: 1, fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text },
    category: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.brand, textTransform: "uppercase", letterSpacing: 0.6 },
    description: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
    setting: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: tokens.sunken,
      borderRadius: radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 4,
    },
    settingText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
    actions: { flexDirection: "row", gap: 12, marginTop: 16 },
    action: { flex: 1 },
    // The square-with-dot veg / non-veg label, as on the menu list.
    vegBox: { width: 14, height: 14, borderWidth: 1.5, borderRadius: 3, alignItems: "center", justifyContent: "center" },
    vegDot: { width: 6, height: 6, borderRadius: 3 },
  });
