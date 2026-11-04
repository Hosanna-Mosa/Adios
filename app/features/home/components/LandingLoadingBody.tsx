// Animated must come from react-native, not reanimated: the opacity/translate
// values below are RN Animated.Value instances created in app/index.tsx.
import { View, Animated } from "react-native";
import { fontFamilies, typography } from "@/constants/typography";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  letters: any[];
  opacityAnim: any;
  translateAnim: any;
}

export function LandingLoadingBody({
  letters,
  opacityAnim,
  translateAnim,
}: Props) {
  // onBrand, not white: dark mode's splash is a lighter orange (#FF9A4D), where
  // white letters had too little contrast. onBrand is the colour meant for text on it.
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  return (
    <>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {letters.map((letter, idx) => (
        <Animated.Text
          key={idx}
          style={{
            fontSize: typography.sizes.extraLarge,
            fontFamily: fontFamilies.heading.bold,
            color: tokens.onBrand,
            marginHorizontal: 4,
            textTransform: "uppercase",
            letterSpacing: 2,
            transform: [{ translateY: translateAnim[idx] }],
            opacity: opacityAnim[idx],
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 6,
          }}
        >
          {letter}
        </Animated.Text>
      ))}
    </View>
    </>
  );
}
