// Shared motion vocabulary — mirrors app/motion/presets.ts (same Reanimated-4
// native entering/exiting approach; moti was rejected, see that file's header
// comment for why). Screens should compose these rather than hand-roll new
// Animated.Value/useSharedValue boilerplate.
import { useEffect } from "react";
import {
  Easing,
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };
export const SPRING_GENTLE = { damping: 22, stiffness: 160, mass: 0.9 };
export const TIMING_FAST = { duration: 180, easing: Easing.out(Easing.cubic) };
export const TIMING_BASE = { duration: 260, easing: Easing.out(Easing.cubic) };

// --- Entrance/exit presets (pass to <Animated.View entering={...}>) --------

export const fadeIn = (delayMs = 0) => FadeIn.delay(delayMs).duration(240);

export const fadeInUp = (delayMs = 0) =>
  FadeInUp.delay(delayMs).duration(320).easing(Easing.out(Easing.cubic));

export const fadeInDown = (delayMs = 0) =>
  FadeInDown.delay(delayMs).duration(320).easing(Easing.out(Easing.cubic));

export const staggerListItem = (index: number, baseDelayMs = 40) =>
  FadeInUp.delay(Math.min(index, 8) * baseDelayMs)
    .duration(280)
    .easing(Easing.out(Easing.cubic));

export const fadeOut = FadeOut.duration(180);

export const modalSlideUp = SlideInDown.duration(320).easing(Easing.out(Easing.cubic));
export const modalSlideOut = SlideOutDown.duration(220).easing(Easing.in(Easing.cubic));

// --- Interaction hooks ------------------------------------------------------

/** Press-in/press-out scale feedback for Pressable-based components. Pair
 * with expo-haptics (Haptics.impactAsync) on press-in for primary actions. */
export function usePressScale(scaleTo = 0.96) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => {
    scale.value = withTiming(scaleTo, TIMING_FAST);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
  };
  return { animatedStyle, onPressIn, onPressOut };
}

/** Looping opacity pulse for Skeleton loading placeholders. */
export function useShimmer() {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.4, { duration: 700 })),
      -1,
      true,
    );
  }, [opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}
