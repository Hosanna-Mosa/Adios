import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/helper-task.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["task"]) =>
  StyleSheet.create({

    headline: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, letterSpacing: -0.5, color: tokens.text, paddingHorizontal: 16, marginTop: 4 },
    typeRow: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
    typeChip: { borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
    typeChipText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },

    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },

    locationCard: { flexDirection: "row", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 14 },
    railCol: { width: 14, alignItems: "center", paddingTop: 14 },
    pickupDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2.5, borderColor: accent.accent },
    dropSquare: { width: 10, height: 10, borderRadius: 2, backgroundColor: tokens.text },
    railLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: tokens.borderStrong, marginVertical: 4 },
    fieldLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    inputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
    input: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, paddingVertical: 4 },
    dropdown: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 12, marginTop: 6, overflow: "hidden" },
    dropdownRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: tokens.border },
    dropdownText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },

    timeStepper: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: tokens.surface,
      borderWidth: 1, borderColor: tokens.border, borderRadius: 14, paddingHorizontal: 14, minHeight: 56,
    },
    stepperSign: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: accent.accent },
    stepperValue: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
    stepperUnit: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },

    descBox: { borderWidth: 2, borderColor: accent.accent, borderRadius: 14, backgroundColor: tokens.surface, padding: 14, minHeight: 104 },
    descInput: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.text, minHeight: 76 },
    descHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 8 },

    footer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20, borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface },
    suggestedRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
    suggestedLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    suggestedValue: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    primaryBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    primaryBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },

    offerBlock: { alignItems: "center", paddingHorizontal: 16, paddingTop: 24 },
    offerEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: accent.accent },
    offerAmount: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, letterSpacing: -0.8, color: tokens.text, marginTop: 8 },
    offerSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 8 },
    offerStepBtn: { width: moderateScale(56), height: moderateScale(56), borderRadius: 18, borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, alignItems: "center", justifyContent: "center" },
    offerStepBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.extraLarge, color: tokens.text },
    offerStepsMid: { flex: 1, height: moderateScale(56), borderRadius: 18, backgroundColor: accent.skin, borderWidth: 1, borderColor: accent.accent, alignItems: "center", justifyContent: "center" },
    offerStepsMidText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },
    helperCountNote: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, marginBottom: 10, textAlign: "center" },

    titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
    spinner: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: accent.accent, borderTopColor: "transparent" },
    matchingTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text },
    subtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 10 },
    checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    checkDone: { width: 22, height: 22, borderRadius: 11, backgroundColor: accent.accent, alignItems: "center", justifyContent: "center" },
    checkPending: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: accent.accent },
    checkText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    declineNote: { marginTop: 16, backgroundColor: tokens.warningSkin, borderRadius: 12, padding: 12 },
    declineNoteText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec },
    raiseChip: { borderWidth: 1, borderColor: accent.accent, backgroundColor: accent.skin, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
    raiseChipText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },

    cancelBtn: { borderWidth: 1, borderColor: tokens.error, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    cancelBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.error },

    otpCard: { backgroundColor: accent.skin, borderWidth: 1, borderColor: accent.accent, borderRadius: 16, padding: 14, marginTop: 8, marginBottom: 14 },
    otpLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: accent.accent },
    otpDigit: { flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: accent.accent, borderRadius: 10, paddingVertical: 11, alignItems: "center" },
    otpDigitText: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, color: tokens.text },
    otpHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 10 },

    driverRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: tokens.border },
    driverAvatar: { width: 56, height: 56, borderRadius: 999, backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    driverName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text },
    driverMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 3 },
    driverPrice: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, letterSpacing: -0.3, color: tokens.text },

    callBtn: { flex: 1, backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    callBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    messageBtn: { flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    messageBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },

    routeCard: { flexDirection: "row", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 13 },
    railColSmall: { width: 12, alignItems: "center", paddingTop: 5 },
    pickupDotSmall: { width: 9, height: 9, borderRadius: 5, borderWidth: 2.5, borderColor: accent.accent },
    dropSquareSmall: { width: 9, height: 9, borderRadius: 2, backgroundColor: tokens.text },
    routeAddr: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
  });
