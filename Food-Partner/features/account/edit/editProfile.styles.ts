import { StyleSheet } from "react-native";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/edit-profile.tsx. Cards are ui/Card, fields ui/TextField.
export const createEditStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 14 },
    card: { gap: 16 },
    photos: { marginBottom: 36 },
    cover: { height: 140, borderRadius: radius.md, overflow: "hidden", backgroundColor: tokens.sunken },
    coverImage: { ...StyleSheet.absoluteFillObject },
    coverBadge: { position: "absolute", right: 10, bottom: 10, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, backgroundColor: "rgba(0,0,0,0.55)" },
    coverBadgeText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.onBrand },
    avatarWrap: { position: "absolute", left: 16, bottom: -34, backgroundColor: "transparent", borderRadius: 42 },
    avatar: { borderWidth: 3, borderColor: tokens.bg },
    avatarBadge: { position: "absolute", right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: tokens.brand, borderWidth: 2, borderColor: tokens.bg },
    field: { gap: 10 },
    label: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.muted },
    prefix: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.muted },
    location: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.sunken,
      padding: 12,
    },
    locationTexts: { flex: 1, gap: 2 },
    locationAddress: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.text },
    locationCoords: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.muted },
  });

export type EditProfileStyles = ReturnType<typeof createEditStyles>;
