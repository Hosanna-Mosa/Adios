import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for the restaurant Menu tab (app/(tabs)/menu.tsx) and its DishCard.
// Containers are ui/Card; only the dish's own content is styled here.
export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    search: { marginHorizontal: 16 },

    dishCard: { padding: 0, overflow: "hidden" },
    dishRow: { flexDirection: "row", gap: 12, padding: 12 },
    imageWrap: {
      width: moderateScale(92),
      height: moderateScale(92),
      borderRadius: radius.md,
      overflow: "hidden",
      backgroundColor: tokens.sunken,
      alignItems: "center",
      justifyContent: "center",
    },
    image: { width: "100%", height: "100%" },
    imageDim: { opacity: 0.45 },
    soldOutTag: {
      position: "absolute",
      bottom: 6,
      left: 6,
      right: 6,
      borderRadius: 6,
      backgroundColor: "rgba(0,0,0,0.65)",
      paddingVertical: 2,
      alignItems: "center",
    },
    soldOutText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: "#FFFFFF", textTransform: "uppercase" },
    dishBody: { flex: 1, minWidth: 0, gap: 3 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    dishName: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    category: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.brand, textTransform: "uppercase", letterSpacing: 0.6 },
    description: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec },
    price: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text, marginTop: 2 },
    dishFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: tokens.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    stockTexts: { flex: 1 },
    stockLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small },
    stockHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.muted },
    actions: { flexDirection: "row", gap: 8 },

    // The square-with-dot veg / non-veg label printed on Indian food packaging.
    vegBox: { width: 14, height: 14, borderWidth: 1.5, borderRadius: 3, alignItems: "center", justifyContent: "center" },
    vegDot: { width: 6, height: 6, borderRadius: 3 },
  });

export type MenuStyles = ReturnType<typeof createStyles>;
