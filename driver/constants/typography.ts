// The app has exactly four text sizes. Every fontSize and lineHeight in the
// codebase resolves to one of these tokens; the `flavour/typography-tokens`
// lint rule in eslint.config.js keeps raw numbers from coming back.
//
// The four values were chosen from the codebase's own distribution (326 sites,
// 18 distinct values from 9 to 32), not from taste: 11/14/17/24 leaves 91% of
// sites within 1dp of what they declared before, which is the point at which a
// size change stops being visible.
//
// Font pairing (Familjen Grotesk for headings, Figtree for body) is applied
// globally in utils/typographyPatch.ts.
import { moderateScale } from "react-native-size-matters";

export const fontFamilies = {
  heading: {
    regular: "FamiljenGrotesk_400Regular",
    medium: "FamiljenGrotesk_500Medium",
    semibold: "FamiljenGrotesk_600SemiBold",
    bold: "FamiljenGrotesk_700Bold",
  },
  body: {
    regular: "Figtree_400Regular",
    medium: "Figtree_500Medium",
    semibold: "Figtree_600SemiBold",
    bold: "Figtree_700Bold",
  },
};

export const typography = {
  sizes: {
    small: moderateScale(11), // 11dp
    medium: moderateScale(14), // 14dp
    large: moderateScale(17), // 17dp
    extraLarge: moderateScale(24), // 24dp
  },
  // One line height per size. A style object always pairs a size token with the
  // lineHeight token of the same name. Values are the codebase's own ~1.4
  // ratio, which is what the 22 real fontSize/lineHeight pairs measured.
  lineHeights: {
    small: moderateScale(15),
    medium: moderateScale(20),
    large: moderateScale(24),
    extraLarge: moderateScale(34),
  },
  weights: {
    black: "900" as const,
    extraBold: "800" as const,
    bold: "700" as const,
    semibold: "600" as const,
    medium: "500" as const,
    regular: "400" as const,
    light: "300" as const,
  },
};

export type TypographySize = keyof typeof typography.sizes;
