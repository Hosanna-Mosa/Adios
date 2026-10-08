import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import type { EdgeInsets } from "react-native-safe-area-context";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/package-delivery/search.tsx — finding the pickup or drop address.

export const createPackageDeliverySearchStyles = (tokens: ThemeTokens, accent: ServiceTokens, insets: EdgeInsets) =>
  StyleSheet.create({
    header: { paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: tokens.surface, borderBottomWidth: 1, borderBottomColor: tokens.border },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    title: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    inputWrap: {
      flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, minHeight: moderateScale(50),
      borderWidth: 1.5, borderColor: accent.accent, borderRadius: 14, paddingHorizontal: 14, backgroundColor: tokens.bg,
    },
    kindDot: { width: 10, height: 10, borderRadius: 5 },
    input: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, paddingVertical: 10 },

    list: { paddingBottom: insets.bottom + 24 },
    sectionLabel: {
      fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase",
      color: tokens.muted, paddingHorizontal: 16, marginTop: 18, marginBottom: 6,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 13, minHeight: 60 },
    rowIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    rowIconAccent: { backgroundColor: accent.skin },
    rowBody: { flex: 1, minWidth: 0 },
    rowTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    rowTitleAccent: { color: accent.accent },
    rowSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec, marginTop: 2 },
    divider: { height: 1, backgroundColor: tokens.border, marginLeft: 66 },
    message: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center", paddingHorizontal: 24, marginTop: 28 },
  });

export type PackageDeliverySearchStyles = ReturnType<typeof createPackageDeliverySearchStyles>;
