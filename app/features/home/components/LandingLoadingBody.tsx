// Animated must come from react-native, not reanimated: everything below is driven by
// RN Animated values with the native driver.
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale as ms } from "react-native-size-matters";
import { fontFamilies, typography } from "@/constants/typography";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// The splash: five service badges (food, bike, car, parcel, driver) pop in around a ring
// and orbit it, then fly into the centre as the ADIOS wordmark and tagline settle.
// The whole thing runs in about 2.6 s, inside the intro time app/index.tsx waits for.

interface Props {
  /** Kept for callers (app/index.tsx still passes them); this splash runs its own animation. */
  letters?: any[];
  opacityAnim?: any;
  translateAnim?: any;
}

const ICONS = ["hamburger", "motorbike", "car", "package-variant-closed", "racing-helmet"] as const;
const RADIUS = ms(104);
const BADGE = ms(54);
const ORBIT_DEG = 100;

export function LandingLoadingBody(_props: Props) {
  const { t } = useTranslation();
  // onBrand, not white: dark mode's splash is a lighter pink, where white had too little contrast.
  const tokens = designTokens[useThemeStore((s) => s.theme)];

  const intro = useRef(new Animated.Value(0)).current; // badges pop in, one after another
  const orbit = useRef(new Animated.Value(0)).current; // slow turn of the ring
  const merge = useRef(new Animated.Value(0)).current; // badges fly in, wordmark appears
  const pulse = useRef(new Animated.Value(0)).current; // soft ring behind everything

  useEffect(() => {
    const run = Animated.parallel([
      Animated.timing(intro, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(orbit, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(1250),
        Animated.timing(merge, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true })),
    ]);
    run.start();
    return () => run.stop();
  }, [intro, orbit, merge, pulse]);

  const fade = merge.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
  const shrink = merge.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] });
  const reach = merge.interpolate({ inputRange: [0, 1], outputRange: [RADIUS, 0] });
  const ringTurn = orbit.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${ORBIT_DEG}deg`] });

  const wordOpacity = merge.interpolate({ inputRange: [0.45, 0.9], outputRange: [0, 1], extrapolate: "clamp" });
  const wordScale = merge.interpolate({ inputRange: [0.45, 1], outputRange: [0.7, 1], extrapolate: "clamp" });
  const tagOpacity = merge.interpolate({ inputRange: [0.8, 1], outputRange: [0, 1], extrapolate: "clamp" });
  const tagLift = merge.interpolate({ inputRange: [0.8, 1], outputRange: [8, 0], extrapolate: "clamp" });

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.25] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.28, 0] });

  return (
    <View style={styles.stage}>
      <Animated.View
        style={[styles.pulse, { borderColor: tokens.onBrand, opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]}
      />
      <View style={[styles.guide, { borderColor: tokens.onBrand }]} />

      <Animated.View style={[styles.ring, { transform: [{ rotate: ringTurn }] }]}>
        {ICONS.map((name, i) => {
          const angle = i * 72 - 90;
          const start = i * 0.14;
          const pop = intro.interpolate({ inputRange: [start, start + 0.3], outputRange: [0, 1], extrapolate: "clamp" });
          const scale = Animated.multiply(pop, shrink);
          const opacity = Animated.multiply(pop, fade);
          // Counter-turn so each icon stays upright while the ring turns.
          const upright = orbit.interpolate({ inputRange: [0, 1], outputRange: [`${-angle}deg`, `${-angle - ORBIT_DEG}deg`] });
          return (
            <Animated.View
              key={name}
              style={[
                styles.badgeSlot,
                { opacity, transform: [{ rotate: `${angle}deg` }, { translateX: reach }, { rotate: upright }, { scale }] },
              ]}
            >
              <View style={[styles.badge, { backgroundColor: tokens.onBrand }]}>
                <MaterialCommunityIcons name={name} size={ms(28)} color={tokens.brand} />
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>

      <Animated.Text
        style={[styles.word, { color: tokens.onBrand, opacity: wordOpacity, transform: [{ scale: wordScale }] }]}
        accessibilityRole="header"
      >
        ADIOS
      </Animated.Text>
      <Animated.Text style={[styles.tag, { color: tokens.onBrand, opacity: tagOpacity, transform: [{ translateY: tagLift }] }]}>
        {t("app.splash.tagline", "Food · Rides · Delivery · Helpers")}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: ms(300), height: ms(300), alignItems: "center", justifyContent: "center" },
  pulse: { position: "absolute", width: ms(210), height: ms(210), borderRadius: ms(105), borderWidth: 2 },
  guide: { position: "absolute", width: RADIUS * 2, height: RADIUS * 2, borderRadius: RADIUS, borderWidth: 1, opacity: 0.18 },
  ring: { position: "absolute", width: 0, height: 0, alignItems: "center", justifyContent: "center" },
  badgeSlot: { position: "absolute", width: BADGE, height: BADGE, marginLeft: -BADGE / 2, marginTop: -BADGE / 2 },
  badge: { flex: 1, borderRadius: BADGE / 2, alignItems: "center", justifyContent: "center" },
  word: {
    fontSize: typography.sizes.extraLarge,
    fontFamily: fontFamilies.heading.bold,
    letterSpacing: 6,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  tag: {
    position: "absolute",
    bottom: ms(70),
    fontSize: typography.sizes.small,
    fontFamily: fontFamilies.body.semibold,
    letterSpacing: 0.5,
  },
});
