import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import type { EdgeInsets } from "react-native-safe-area-context";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/package-delivery/confirm.tsx — route map, vehicle choice, payment, book.

export const createPackageDeliveryConfirmStyles = (tokens: ThemeTokens, accent: ServiceTokens, insets: EdgeInsets) =>
  StyleSheet.create({
    topBar: { position: "absolute", top: insets.top + 8, left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 10 },
    circleBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    routeChip: {
      flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.surface,
      borderWidth: 1, borderColor: tokens.border, borderRadius: 14, paddingHorizontal: 12, minHeight: moderateScale(40),
    },
    routeChipText: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    recenterBtn: { position: "absolute", right: 16 },

    sheet: {
      position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "68%",
      backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderTopWidth: 1, borderColor: tokens.border, paddingTop: 10,
    },
    handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 12 },
    body: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
    sheetTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text, marginBottom: 2 },

    vehicleRow: {
      flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderColor: "transparent",
      borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, minHeight: 76,
    },
    vehicleRowOn: { borderColor: accent.accent, backgroundColor: accent.skin },
    vehicleImage: { width: moderateScale(52), height: moderateScale(48) },
    vehicleBody: { flex: 1, minWidth: 0 },
    vehicleName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    vehicleHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 1 },
    vehicleMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },
    vehicleMetaWarn: { color: tokens.warning },
    vehiclePrice: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, letterSpacing: -0.3, color: tokens.text },

    notice: {
      flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.errorSkin,
      borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    },
    noticeText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.error },

    footer: {
      paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 14, gap: 12,
      borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface,
    },
    payAtRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    payAtLabel: {
      flex: 1, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1,
      textTransform: "uppercase", color: tokens.muted,
    },
    segment: { flexDirection: "row", backgroundColor: tokens.sunken, borderRadius: 999, padding: 3 },
    segmentBtn: { paddingHorizontal: 18, minHeight: moderateScale(36), borderRadius: 999, alignItems: "center", justifyContent: "center" },
    segmentBtnOn: { backgroundColor: accent.accent },
    segmentText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    segmentTextOn: { color: accent.on },
    payAtHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: -4 },

    bookBtn: {
      backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    bookBtnOff: { opacity: 0.5 },
    bookText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    bookPrice: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on, opacity: 0.85 },
  });

export type PackageDeliveryConfirmStyles = ReturnType<typeof createPackageDeliveryConfirmStyles>;
