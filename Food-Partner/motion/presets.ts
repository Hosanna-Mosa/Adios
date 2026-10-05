// Shared motion vocabulary — the "Framer Motion" layer for this app, built
// directly on react-native-reanimated 4's own entering/exiting/layout APIs
// (moti was considered and rejected: it targets Reanimated 3 and has
// confirmed broken-animation reports on Reanimated 4, which is what this
// app runs). Screens should compose these rather than hand-roll new
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

// Reusable spring/timing configs — keep every interactive animation in the
// app feeling like the same physical material.
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

// Staggered entrance for list/section items — pass the item's index.
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
