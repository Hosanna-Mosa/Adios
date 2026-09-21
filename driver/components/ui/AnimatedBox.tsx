import Animated from "react-native-reanimated";

/** Transparent `Animated.View` (react-native-reanimated).
 *
 * A direct re-export, not a wrapper: reanimated inspects the component it is
 * given, so wrapping it in another function component would break `entering`,
 * `exiting` and shared-value styles. Aliasing keeps behaviour identical while
 * letting call sites read as a named component.
 */
export const AnimatedBox = Animated.View;
