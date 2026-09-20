import { moderateScale } from "react-native-size-matters";

// Font families from the new design-system spec. Each RN <Text> needs an
// exact fontFamily per weight (these are static font files, not a single
// variable font), so pick the family by the weight you actually want.
// `heading` (Familjen Grotesk) is for display/headline text; `body`
// (Figtree) is for everything else — labels, paragraphs, buttons.
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

// The four — and only four — text sizes in the app. Every fontSize in code is
// one of these tokens; the eslint rule `flavour/typography-tokens` rejects raw
// numbers and moderateScale() calls. Display/hero text clamps to extraLarge:
// there is deliberately no fifth size.
//
// Each value is moderateScale'd once, here, so a token always compares equal to
// itself. The old runtime patch in app/_layout.tsx used to snap already-scaled
// numbers into buckets, which meant the same declaration rendered at different
// sizes depending on screen width. Tokens remove that entirely.
export const typography = {
  // Numbers are dp (density-independent pixels, what React Native's fontSize
  // takes). moderateScale nudges them up a little on wider screens.
  sizes: {
    small: moderateScale(12), // 12dp
    medium: moderateScale(14), // 14dp
    large: moderateScale(18), // 18dp
    extraLarge: moderateScale(24), // 24dp
  },
  // One line height per size. A style object always pairs a size token with the
  // lineHeight token of the same name.
  lineHeights: {
    small: moderateScale(16), // 16dp
    medium: moderateScale(20), // 20dp
    large: moderateScale(24), // 24dp
    extraLarge: moderateScale(28), // 28dp
  },
};

export type TypographySize = keyof typeof typography.sizes;
