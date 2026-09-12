import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/delivery/saved-addresses.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["delivery"]) =>
  StyleSheet.create({

    section: { paddingHorizontal: 16, paddingTop: 18 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12 },

    addBtn: { backgroundColor: tokens.surface, borderWidth: 1, borderStyle: "dashed", borderColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    addBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },
    currentLocRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 12, paddingVertical: 6 },
    currentLocText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },

    card: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, overflow: "hidden" },
    addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
    addressRowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    avatar: { width: 36, height: 36, borderRadius: 11, backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.sec },
    addrLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    addrLine: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 3 },
    addrInstructions: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 5 },
    addrContact: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 5 },

    recentRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, minHeight: 52 },
    recentRowDivider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    recentIcon: { width: 36, height: 36, borderRadius: 999, backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    recentName: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    recentSave: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.accent },

    emptyWrap: { alignItems: "center", paddingTop: 76, paddingHorizontal: 32 },
    emptyIconCircle: { width: 76, height: 76, borderRadius: 24, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text, textAlign: "center" },
    emptySubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 10, marginBottom: 22 },
    primaryBtn: { width: "100%", backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    primaryBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    secondaryBtn: { width: "100%", marginTop: 10, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    secondaryBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type SavedAddressesStyles = ReturnType<typeof createStyles>;
