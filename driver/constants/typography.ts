// Mirrors app/constants/typography.ts (same pairing: Familjen Grotesk for
// headings, Figtree for body). See that file for the full rationale.
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
    titleLarge: moderateScale(24),
    titleMedium: moderateScale(22),
    titleSmall: moderateScale(18),
    bodyLarge: moderateScale(16),
    bodyMedium: moderateScale(14),
    bodySmall: moderateScale(12),
    caption: moderateScale(10),
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
  heading1: {
    fontSize: moderateScale(24),
    fontWeight: "600" as const,
  },
  heading2: {
    fontSize: moderateScale(20),
    fontWeight: "700" as const,
  },
  heading3: {
    fontSize: moderateScale(16),
    fontWeight: "600" as const,
  },
  body: {
    fontSize: moderateScale(14),
    fontWeight: "400" as const,
  },
  bodySecondary: {
    fontSize: moderateScale(12),
    fontWeight: "400" as const,
  },
  buttonText: {
    fontSize: moderateScale(15),
    fontWeight: "700" as const,
  },
};
