import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/notifications.tsx, moved out of the screen unchanged.

export const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    markAllText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: accent.accent },

    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
    emptyText: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center", lineHeight: typography.lineHeights.medium },

    row: { flexDirection: "row", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 13 },
    rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    rowTitle: { flex: 0, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    unreadDot: { width: 6, height: 6, borderRadius: 3 },
    rowBody: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 3 },
    rowTime: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted, marginTop: 5 },
  });

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type NotificationsStyles = ReturnType<typeof createStyles>;
