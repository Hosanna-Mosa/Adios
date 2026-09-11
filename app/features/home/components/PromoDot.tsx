import { type ViewStyle } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { STRIDE } from "../constants";

// Moved out of app/(tabs)/index.tsx unchanged. Home-only for now: promote to
// components/ui/ or components/shared/ if a second feature ever needs it.

export function PromoDot({
  index,
  scrollX,
  baseStyle,
  activeColor,
  inactiveColor,
}: {
  index: number;
  scrollX: SharedValue<number>;
  baseStyle: ViewStyle;
  activeColor: string;
  inactiveColor: string;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * STRIDE, index * STRIDE, (index + 1) * STRIDE];
    return {
      width: interpolate(scrollX.value, inputRange, [5, 18, 5], "clamp"),
      backgroundColor: interpolateColor(scrollX.value, inputRange, [inactiveColor, activeColor, inactiveColor]),
    };
  });
  return <Animated.View style={[baseStyle, animatedStyle]} />;
}
