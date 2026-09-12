import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

/** The scooter drives off to the right and back in from the left whenever the
 * driver goes online. */
export function useScooterAnimation(isOnline: boolean) {
  const translateX = useSharedValue(0);
  const scooterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    if (isOnline) {
      translateX.value = withSequence(
        // Drive off screen to the right
        withTiming(200, { duration: 500, easing: Easing.in(Easing.back(1.5)) }),
        // Instantly move off-screen left
        withTiming(-300, { duration: 0 }),
        // Drive in from left to original position
        withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.2)) }),
      );
    }
  }, [isOnline, translateX]);

  return scooterAnimatedStyle;
}
