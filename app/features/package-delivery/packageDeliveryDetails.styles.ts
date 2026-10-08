import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import type { EdgeInsets } from "react-native-safe-area-context";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/package-delivery/details.tsx — house number and contact for one end of the trip.

export const createPackageDeliveryDetailsStyles = (tokens: ThemeTokens, accent: ServiceTokens, insets: EdgeInsets) =>
  StyleSheet.create({
    mapWrap: { height: "34%", backgroundColor: tokens.sunken },
    backBtn: {
      position: "absolute", top: insets.top + 8, left: 16,
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },

    sheet: {
      flex: 1, marginTop: -24, backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderTopWidth: 1, borderColor: tokens.border, paddingTop: 10,
    },
    handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 12 },
    body: { paddingHorizontal: 20, paddingBottom: 24 },

    addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
    addressDot: { width: 12, height: 12, borderRadius: 6, marginTop: 5 },
    addressBody: { flex: 1, minWidth: 0 },
    addressTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: tokens.text },
    addressSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec, marginTop: 2 },
    changeLink: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent, marginTop: 4 },

    field: {
      flexDirection: "row", alignItems: "center", gap: 12, minHeight: moderateScale(52),
      borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, paddingHorizontal: 14, backgroundColor: tokens.surface,
    },
    fieldFocused: { borderColor: accent.accent, borderWidth: 1.5 },
    fieldError: { borderColor: tokens.error },
    input: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, paddingVertical: 12 },
    errorText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.error, marginTop: 6, marginLeft: 4 },

    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 22, marginBottom: 10 },

    checkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 4 },
    checkBox: {
      width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: tokens.borderStrong,
      alignItems: "center", justifyContent: "center",
    },
    checkBoxOn: { backgroundColor: accent.accent, borderColor: accent.accent },
    checkText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },

    chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: tokens.border, borderRadius: 999,
      paddingHorizontal: 14, minHeight: moderateScale(40), backgroundColor: tokens.surface,
    },
    chipOn: { borderColor: accent.accent, backgroundColor: accent.skin },
    chipText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    chipTextOn: { color: tokens.text },
    customLabel: { marginTop: 12 },

    footer: {
      paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 14,
      borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface,
    },
    confirmBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    confirmBtnOff: { opacity: 0.45 },
    confirmText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
  });

export type PackageDeliveryDetailsStyles = ReturnType<typeof createPackageDeliveryDetailsStyles>;
