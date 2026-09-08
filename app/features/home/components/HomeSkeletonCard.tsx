import { useEffect } from "react";
import { View } from "react-native";
import { Easing, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { SkeletonBlock } from "./SkeletonBlock";

// Moved out of app/(tabs)/index.tsx unchanged. Home-only for now: promote to
// components/ui/ or components/shared/ if a second feature ever needs it.

export function HomeSkeletonCard({ tokens }: { tokens: ThemeTokens }) {
  const shimmer = useSharedValue(0);
  const shimmerHighlight = "rgba(255,255,255,0.5)";

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1, false);
  }, [shimmer]);

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
      <SkeletonBlock style={{ height: moderateScale(88), borderRadius: moderateScale(8), backgroundColor: tokens.sunken }} shimmer={shimmer} shimmerHighlight={shimmerHighlight} />
      <SkeletonBlock style={{ width: "70%", height: moderateScale(18), borderRadius: moderateScale(6), backgroundColor: tokens.sunken, marginTop: 12 }} shimmer={shimmer} shimmerHighlight={shimmerHighlight} />
      <SkeletonBlock style={{ width: "45%", height: moderateScale(12), borderRadius: moderateScale(4), backgroundColor: tokens.sunken, marginTop: 8 }} shimmer={shimmer} shimmerHighlight={shimmerHighlight} />
    </View>
  );
}
