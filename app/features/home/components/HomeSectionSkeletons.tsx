import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Easing, useSharedValue, withRepeat, withTiming, type SharedValue } from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { CARD_GAP, CARD_W } from "../constants";
import { SkeletonBlock } from "./SkeletonBlock";

// Shimmer placeholders for the API-backed sections of the home header (promo
// banners, the greeting ad, the ₹149 rail, the cuisine strip). Same sweep as
// HomeSkeletonCard so the whole screen shimmers as one while it loads.

const HIGHLIGHT = "rgba(255,255,255,0.5)";

function useSweep(): SharedValue<number> {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1, false);
  }, [shimmer]);
  return shimmer;
}

interface Props {
  tokens: ThemeTokens;
}

/** Two promo-card shaped blocks in the carousel's slot. */
export function PromoCarouselSkeleton({ tokens }: Props) {
  const shimmer = useSweep();
  return (
    <View style={{ marginTop: 20 }}>
      <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: CARD_GAP }}>
        {[0, 1].map((i) => (
          <SkeletonBlock
            key={i}
            style={{ width: CARD_W, height: 140, borderRadius: moderateScale(18), backgroundColor: tokens.sunken }}
            shimmer={shimmer}
            shimmerHighlight={HIGHLIGHT}
          />
        ))}
      </ScrollView>
      <View style={{ height: 17 }} />
    </View>
  );
}

/** The greeting ad: image + caption lines. */
export function GreetingAdSkeleton({ tokens }: Props) {
  const shimmer = useSweep();
  return (
    <View style={{ marginHorizontal: 16, marginTop: 16 }}>
      <SkeletonBlock style={{ height: 140, borderRadius: moderateScale(16), backgroundColor: tokens.sunken }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
      <SkeletonBlock style={{ width: "55%", height: moderateScale(14), borderRadius: moderateScale(4), backgroundColor: tokens.sunken, marginTop: 10 }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
    </View>
  );
}

/** Section title + a row of ₹149 meal cards. */
export function MealsRailSkeleton({ tokens }: Props) {
  const shimmer = useSweep();
  const block = { backgroundColor: tokens.sunken };
  return (
    <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
      <SkeletonBlock style={{ ...block, width: "45%", height: moderateScale(18), borderRadius: moderateScale(6), marginBottom: 12 }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
      <View style={{ flexDirection: "row", gap: 12, overflow: "hidden" }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 132 }}>
            <SkeletonBlock style={{ ...block, width: 132, height: 96, borderRadius: moderateScale(8) }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
            <SkeletonBlock style={{ ...block, width: "80%", height: moderateScale(12), borderRadius: moderateScale(4), marginTop: 8 }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
            <SkeletonBlock style={{ ...block, width: "55%", height: moderateScale(10), borderRadius: moderateScale(4), marginTop: 6 }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
          </View>
        ))}
      </View>
    </View>
  );
}

/** A row of cuisine circles with labels. */
export function CuisineStripSkeleton({ tokens }: Props) {
  const shimmer = useSweep();
  const block = { backgroundColor: tokens.sunken };
  return (
    <View style={{ marginTop: 22, paddingHorizontal: 16, flexDirection: "row", gap: 16, overflow: "hidden" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={{ width: 64, alignItems: "center" }}>
          <SkeletonBlock style={{ ...block, width: 64, height: 64, borderRadius: 999 }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
          <SkeletonBlock style={{ ...block, width: 44, height: moderateScale(10), borderRadius: moderateScale(4), marginTop: 8 }} shimmer={shimmer} shimmerHighlight={HIGHLIGHT} />
        </View>
      ))}
    </View>
  );
}
