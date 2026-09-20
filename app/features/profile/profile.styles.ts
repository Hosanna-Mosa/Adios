import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/(tabs)/profile.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({

    profileCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 20, padding: 18, marginTop: 12 },
    avatar: { width: 64, height: 64, borderRadius: 999 },
    avatarPlaceholder: { width: 64, height: 64, borderRadius: 999, backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    avatarInitial: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, color: tokens.sec },
    avatarEditBadge: { position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: accent.accent, borderWidth: 2, borderColor: tokens.surface, alignItems: "center", justifyContent: "center" },
    profileName: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },
    profilePhone: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 4 },

    statsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
    statTile: { flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
    statValue: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, letterSpacing: -0.3, color: tokens.text },
    statLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },

    menuCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, overflow: "hidden", marginTop: 20 },
    menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, minHeight: 56 },
    menuIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    menuLabel: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    menuBadgeText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    menuCountBadge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: tokens.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
    menuCountBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: "#fff" },

    signOutBtn: { marginTop: 14, borderWidth: 1, borderColor: tokens.error, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    signOutBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.error },
    signOutAllBtn: { marginTop: 10, minHeight: moderateScale(44), alignItems: "center", justifyContent: "center" },
    signOutAllBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },

    modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
    modalBody: { backgroundColor: tokens.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "88%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
    modalTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text },
    inputGroup: { gap: 8, marginBottom: 18 },
    inputLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    textInput: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    saveBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    saveBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
  });
