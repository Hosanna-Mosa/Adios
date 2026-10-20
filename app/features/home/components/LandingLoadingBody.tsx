// Animated must come from react-native, not reanimated: the values below are RN
// Animated.Value instances created in features/home/useIntroSplash.ts.
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { SPLASH_WORD, type IntroSplashAnims } from "@/features/home/useIntroSplash";

const MARK = require("@/assets/images/splash-mark.png");

interface Props {
  anims: IntroSplashAnims;
}

/** The intro splash: the white "A" mark (same artwork as the native splash) with ripples,
 * then the ADIOS wordmark and tagline. */
export function LandingLoadingBody({ anims }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  // Text on the brand colour uses onBrand, not white: dark mode's brand is a lighter orange (#FF9A4D),
  // where white letters had too little contrast.
  const onBrand = designTokens[useThemeStore((st) => st.theme)].onBrand;
  // Same share of the screen width as the native splash image's mark (assets/images/splash-icon.png).
  const markSize = Math.min(width * 0.36, 180);

  const markScale = anims.mark.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 0.9, 1] });
  const lift = anims.lift.interpolate({ inputRange: [0, 1], outputRange: [0, -markSize * 0.3] });
  const ringScale = anims.ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] });
  const ringOpacity = anims.ring.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <Animated.View style={[styles.stack, { transform: [{ translateY: lift }] }]}>
      <View style={{ width: markSize, height: markSize, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          pointerEvents="none"
          style={[styles.ring, { width: markSize, height: markSize, borderRadius: markSize / 2, opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
        />
        <Animated.Image
          source={MARK}
          style={[styles.mark, { width: markSize, height: markSize, borderRadius: markSize / 2, transform: [{ scale: markScale }] }]}
        />
      </View>

      <View style={styles.wordRow}>
        {SPLASH_WORD.map((letter, idx) => (
          <Animated.Text
            key={idx}
            style={[
              styles.wordLetter,
              {
                color: onBrand,
                opacity: anims.letters[idx],
                transform: [{ translateY: anims.letters[idx].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>

      <Animated.Text style={[styles.tagline, { color: onBrand, opacity: anims.tagline }]} numberOfLines={2}>
        {/* The splash is always English, whichever language the customer has chosen. */}
        {t("app.home.foodMeatRidesHelpersAndCourier", { lng: "en" })}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: "center", paddingHorizontal: 32 },
  ring: { position: "absolute", borderWidth: 2, borderColor: "#FFFFFF" },
  mark: {
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  wordRow: { flexDirection: "row", marginTop: 28 },
  wordLetter: {
    fontFamily: fontFamilies.heading.bold,
    fontSize: typography.sizes.extraLarge,
    color: "#FFFFFF",
    letterSpacing: 6,
    marginHorizontal: 2,
  },
  tagline: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 10,
  },
});
