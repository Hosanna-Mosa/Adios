import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { moderateScale } from "react-native-size-matters";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { SPRING } from "@/motion/presets";

export interface Segment<K extends string> {
  key: K;
  label: string;
  /** Small count shown after the label, e.g. pending requests. */
  count?: number;
}

interface Props<K extends string> {
  segments: Segment<K>[];
  value: K;
  onChange: (key: K) => void;
  style?: StyleProp<ViewStyle>;
}

/** A pill row of mutually exclusive options with a spring-animated highlight. */
export function SegmentedControl<K extends string>({ segments, value, onChange, style }: Props<K>) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const [width, setWidth] = React.useState(0);
  const segmentWidth = segments.length ? width / segments.length : 0;
  const index = Math.max(0, segments.findIndex((s) => s.key === value));
  const x = useSharedValue(0);

  React.useEffect(() => {
    x.value = withSpring(index * segmentWidth, SPRING);
  }, [index, segmentWidth, x]);

  const indicator = useAnimatedStyle(() => ({ width: segmentWidth, transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.track, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width - 8)}>
      {width > 0 ? (
        <Animated.View style={[styles.indicatorWrap, indicator]}>
          <View style={styles.indicator} />
        </Animated.View>
      ) : null}
      {segments.map((segment) => {
        const selected = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            style={styles.segment}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync().catch(() => {});
              onChange(segment.key);
            }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {segment.label}
            </Text>
            {segment.count ? (
              <View style={[styles.count, selected && styles.countSelected]}>
                <Text style={[styles.countText, selected && styles.countTextSelected]}>{segment.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    track: {
      flexDirection: "row",
      backgroundColor: tokens.sunken,
      borderRadius: radius.pill,
      padding: 4,
      height: moderateScale(46),
    },
    indicatorWrap: {
      position: "absolute",
      top: 4,
      bottom: 4,
      left: 4,
    },
    indicator: {
      flex: 1,
      backgroundColor: tokens.surface,
      borderRadius: radius.pill,
      ...elevation.sm,
    },
    segment: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    label: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.sec,
    },
    labelSelected: {
      color: tokens.text,
    },
    count: {
      minWidth: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(10),
      paddingHorizontal: 5,
      backgroundColor: tokens.borderStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    countSelected: {
      backgroundColor: tokens.brand,
    },
    countText: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      color: tokens.surface,
    },
    countTextSelected: {
      color: tokens.onBrand,
    },
  });
