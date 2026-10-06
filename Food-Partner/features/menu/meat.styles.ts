import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/(tabs)/inventory.tsx — the meat centre's stock and prices.
export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: { gap: 12 },
    top: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconTile: {
      width: moderateScale(52),
      height: moderateScale(52),
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    image: { width: "100%", height: "100%" },
    imageDim: { opacity: 0.45 },
    texts: { flex: 1, minWidth: 0, gap: 2 },
    name: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    weight: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
    badge: { marginTop: 4 },
    priceRow: { backgroundColor: tokens.sunken, borderRadius: radius.md, minHeight: undefined, paddingVertical: 10 },
    priceRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    price: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    // RefreshList already puts 12dp above its footer.
    note: { marginTop: 4 },
    sheetBody: { gap: 16, marginTop: 18, marginBottom: 6 },
  });

export type MeatStyles = ReturnType<typeof createStyles>;
