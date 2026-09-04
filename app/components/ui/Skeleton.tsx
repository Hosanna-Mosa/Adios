import React from "react";
import { DimensionValue } from "react-native";
import Animated from "react-native-reanimated";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useShimmer } from "@/motion/presets";

interface Props {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  style?: any;
}

/** Shimmering loading placeholder — generalized from the home screen's
 * original one-off skeleton cards so every loading state can share it. */
export function Skeleton({ width, height, radius: r = radius.sm, style }: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const shimmerStyle = useShimmer();

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: bgFor(tokens) },
        shimmerStyle,
        style,
      ]}
    />
  );
}

const bgFor = (tokens: ThemeTokens) => tokens.sunken;
