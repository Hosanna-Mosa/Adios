import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/support.tsx, moved out of the screen unchanged.

export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({

    heroTitle: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, letterSpacing: -0.5, color: tokens.text, paddingHorizontal: 16, paddingTop: 16 },

    recentCard: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border,
      borderRadius: 16, padding: 14, marginHorizontal: 16, marginTop: 18,
    },
    recentIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    recentEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
    recentTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 4 },
    recentMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
    recentHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginHorizontal: 18, marginTop: 10 },

    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginHorizontal: 16, marginTop: 22, marginBottom: 12 },

    contactRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, minHeight: 64, marginHorizontal: 16 },
    contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    contactLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    contactDesc: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },

    faqCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, overflow: "hidden", marginHorizontal: 16 },
    faqRow: { padding: 14 },
    faqQuestion: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    faqAnswer: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 10 },
  });
