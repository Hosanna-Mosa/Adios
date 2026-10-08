import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import type { EdgeInsets } from "react-native-safe-area-context";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/package-delivery.tsx — the pickup / drop entry screen.

export const createPackageDeliveryHomeStyles = (tokens: ThemeTokens, accent: ServiceTokens, insets: EdgeInsets) =>
  StyleSheet.create({
    scroll: { paddingBottom: insets.bottom + 24 },

    hero: {
      backgroundColor: accent.skin, paddingTop: insets.top + 8, paddingBottom: 64,
      borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden",
    },
    heroTopRow: { paddingHorizontal: 16 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    heroText: { alignItems: "center", marginTop: 2 },
    heroEyebrow: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    heroTitle: {
      fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: 2, color: tokens.text, marginTop: 2, textAlign: "center", paddingHorizontal: 16,
    },
    heroArt: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 8, marginTop: 10 },
    heroScooter: { width: moderateScale(104), height: moderateScale(95) },
    heroBag: { width: moderateScale(62), height: moderateScale(76), marginBottom: 4 },
    heroAuto: { width: moderateScale(100), height: moderateScale(100) },

    cards: { paddingHorizontal: 16, marginTop: -48 },
    card: {
      backgroundColor: tokens.surface, borderRadius: 20, borderWidth: 1, borderColor: tokens.border,
      paddingHorizontal: 16, paddingVertical: 16,
    },
    pointRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    pointIconWrap: { width: 24, alignItems: "center", paddingTop: 2 },
    dropDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 4, borderColor: tokens.error, marginTop: 3 },
    pointBody: { flex: 1, minWidth: 0 },
    pointTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: tokens.text },
    pointAddress: {
      fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium,
      color: tokens.sec, marginTop: 4,
    },
    editBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 6 },
    dashed: { borderTopWidth: 1, borderStyle: "dashed", borderColor: tokens.borderStrong, marginTop: 14, marginLeft: 36 },
    contactRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 36, paddingTop: 12 },
    contactText: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    contactMissing: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },

    searchField: {
      flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14, minHeight: moderateScale(52),
      borderWidth: 1.5, borderColor: accent.accent, borderRadius: 999, paddingHorizontal: 18,
    },
    searchFieldText: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },

    switchRow: { flexDirection: "row", justifyContent: "flex-end", marginVertical: -18, zIndex: 2, paddingRight: 20 },
    switchBtn: {
      flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: tokens.surface,
      borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 16, minHeight: moderateScale(40),
    },
    switchText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },

    continueBtn: {
      marginHorizontal: 16, marginTop: 20, backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      alignItems: "center", justifyContent: "center",
    },
    continueText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },

    note: { alignItems: "center", paddingHorizontal: 24, marginTop: 28, gap: 2 },
    noteText: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center" },
    noteLink: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },
  });

export type PackageDeliveryHomeStyles = ReturnType<typeof createPackageDeliveryHomeStyles>;
