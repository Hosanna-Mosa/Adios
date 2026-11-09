import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export const SPLASH_WORD = ["A", "D", "I", "O", "S"];

/**
 * The JS intro splash (app/index.tsx). The native splash shows the same white
 * mark on the brand colour, so the hand-off is seamless; from there the mark
 * pops, ripples, lifts, and the wordmark and tagline arrive beneath it.
 * `onDone` runs once, after the whole sequence (about 2.4 s).
 */
export function useIntroSplash(onDone: () => void) {
  const mark = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const letters = useRef(SPLASH_WORD.map(() => new Animated.Value(0))).current;
  const tagline = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ripple = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true })
    );
    ripple.start();

    Animated.sequence([
      Animated.delay(150),
      Animated.spring(mark, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(lift, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.stagger(
          70,
          letters.map((value) => Animated.spring(value, { toValue: 1, tension: 70, friction: 7, useNativeDriver: true }))
        ),
      ]),
      Animated.timing(tagline, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(900),
    ]).start(() => {
      ripple.stop();
      onDone();
    });
    // Runs once on mount; onDone is read at the end of the sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mark, ring, lift, letters, tagline };
}

export type IntroSplashAnims = ReturnType<typeof useIntroSplash>;
