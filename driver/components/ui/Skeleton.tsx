import React from "react";
import { DimensionValue } from "react-native";
import Animated from "react-native-reanimated";
import { Colors, radius } from "@/constants/colors";
import { useShimmer } from "@/motion/presets";

interface Props {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  style?: any;
}

/** Mirrors app/components/ui/Skeleton.tsx. */
export function Skeleton({ width, height, radius: r = radius.sm, style }: Props) {
  const shimmerStyle = useShimmer();
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: Colors.surfaceContainer },
        shimmerStyle,
        style,
      ]}
    />
  );
}
