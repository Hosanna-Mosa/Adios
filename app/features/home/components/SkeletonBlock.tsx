import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// Moved out of app/(tabs)/index.tsx unchanged. Home-only for now: promote to
// components/ui/ or components/shared/ if a second feature ever needs it.

export function SkeletonBlock({ style, shimmer, shimmerHighlight }: { style: ViewStyle; shimmer: SharedValue<number>; shimmerHighlight: string }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-220, 220]) }],
  }));
  return (
    <View style={[style, { overflow: "hidden" }]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { width: 220 }, animatedStyle]}>
        <LinearGradient colors={["transparent", shimmerHighlight, "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFillObject} />
      </Animated.View>
    </View>
  );
}
