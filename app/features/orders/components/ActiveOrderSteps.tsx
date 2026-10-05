import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { type LiveSteps } from "../orderCardHelpers";

interface Props {
  steps: LiveSteps;
  accent: ServiceTokens;
  tokens: ThemeTokens;
}

const DOT = moderateScale(18);

/**
 * The live order's checklist as a labelled stepper: ticked dots for what's done,
 * a pulsing ring on the step in progress, hollow dots for what's left. The rail
 * between dots fills up to the current step.
 */
export function ActiveOrderSteps({ steps, accent, tokens }: Props) {
  const { labels, done, current } = steps;
  const reached = (i: number) => i <= current;

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`${labels[current] ?? ""}, step ${current + 1} of ${labels.length}`}
    >
      {labels.map((label, i) => {
        const isCurrent = i === current;
        return (
          <View key={label + i} style={styles.step}>
            <View style={styles.railRow}>
              <View style={[styles.rail, { backgroundColor: i === 0 ? "transparent" : reached(i) ? accent.accent : tokens.borderStrong }]} />
              {done[i] ? (
                <View style={[styles.dot, { backgroundColor: accent.accent }]}>
                  <Ionicons name="checkmark" size={moderateScale(12)} color={accent.on} />
                </View>
              ) : isCurrent ? (
                <CurrentDot accent={accent} tokens={tokens} />
              ) : (
                <View style={[styles.dot, { borderWidth: 2, borderColor: tokens.borderStrong, backgroundColor: tokens.surface }]} />
              )}
              <View style={[styles.rail, { backgroundColor: i === labels.length - 1 ? "transparent" : reached(i + 1) ? accent.accent : tokens.borderStrong }]} />
            </View>
            <Text
              numberOfLines={2}
              style={[
                styles.label,
                { color: isCurrent ? accent.accent : done[i] ? tokens.sec : tokens.muted },
                isCurrent && { fontFamily: fontFamilies.body.bold },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function CurrentDot({ accent, tokens }: { accent: ServiceTokens; tokens: ThemeTokens }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1100 }), -1, false);
  }, [reduceMotion, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  return (
    <View style={[styles.dot, { borderWidth: 2, borderColor: accent.accent, backgroundColor: tokens.surface }]}>
      {!reduceMotion && <Animated.View style={[styles.halo, { backgroundColor: accent.accent }, haloStyle]} />}
      <View style={[styles.core, { backgroundColor: accent.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginTop: 14 },
  step: { flex: 1, alignItems: "center", minWidth: 0 },
  railRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  rail: { flex: 1, height: 3, borderRadius: 2 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: DOT, height: DOT, borderRadius: DOT / 2 },
  core: { width: DOT / 2.6, height: DOT / 2.6, borderRadius: DOT },
  label: {
    marginTop: 6,
    paddingHorizontal: 2,
    textAlign: "center",
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.small,
    lineHeight: typography.lineHeights.small,
  },
});
