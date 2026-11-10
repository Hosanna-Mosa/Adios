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
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { type Stepper } from "./orderProgress";

interface Props {
  steps: Stepper;
  tokens: ThemeTokens;
}

const DOT = moderateScale(16);

/**
 * The live order's stepper: green ticked dots for what's done, a blue pulsing ring
 * on the step in progress, grey hollow dots for what's left. The rail between dots
 * is green up to the current step.
 */
export function OrderSteps({ steps, tokens }: Props) {
  const { labels, current } = steps;
  const reached = (i: number) => i <= current;

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`${labels[current] ?? ""}, step ${current + 1} of ${labels.length}`}
    >
      {labels.map((label, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <View key={label + i} style={styles.step}>
            <View style={styles.railRow}>
              <View style={[styles.rail, { backgroundColor: i === 0 ? "transparent" : reached(i) ? tokens.success : tokens.border }]} />
              {isDone ? (
                <View style={[styles.dot, { backgroundColor: tokens.success }]}>
                  <Ionicons name="checkmark" size={moderateScale(11)} color={tokens.surface} />
                </View>
              ) : isCurrent ? (
                <CurrentDot tokens={tokens} />
              ) : (
                <View style={[styles.dot, { borderWidth: 2, borderColor: tokens.borderStrong, backgroundColor: tokens.surface }]} />
              )}
              <View style={[styles.rail, { backgroundColor: i === labels.length - 1 ? "transparent" : reached(i + 1) ? tokens.success : tokens.border }]} />
            </View>
            <Text
              numberOfLines={2}
              style={[
                styles.label,
                { color: isCurrent ? tokens.info : isDone ? tokens.text : tokens.sec },
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

function CurrentDot({ tokens }: { tokens: ThemeTokens }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1100 }), -1, false);
  }, [reduceMotion, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.4 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  return (
    <View style={[styles.dot, { borderWidth: 2, borderColor: tokens.info, backgroundColor: tokens.surface }]}>
      {!reduceMotion && <Animated.View style={[styles.halo, { backgroundColor: tokens.info }, haloStyle]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginTop: 12 },
  step: { flex: 1, alignItems: "center", minWidth: 0 },
  railRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  rail: { flex: 1, height: 2, borderRadius: 1 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: DOT, height: DOT, borderRadius: DOT / 2 },
  label: {
    marginTop: 4,
    paddingHorizontal: 1,
    textAlign: "center",
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.small,
    lineHeight: typography.lineHeights.small,
  },
});
