import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// Styles for app/support.tsx. The page is ScreenTitle + OrderCard + ListGroup +
// Accordion, so only spacing and the one hint line are left here.
export const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16 },
    title: { paddingHorizontal: 0, paddingTop: 12 },
    recent: { marginTop: 4 },
    hint: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.sec,
      marginTop: 10,
      marginHorizontal: 2,
    },
  });

export type SupportStyles = ReturnType<typeof createStyles>;
