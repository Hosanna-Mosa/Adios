import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { TIMING_FAST } from "@/motion/presets";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

/** Text input with an animated focus border and inline error state. */
export function TextField({ label, error, icon, style, onFocus, onBlur, ...rest }: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [theme]);
  const focus = useSharedValue(0);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: focus.value > 0.5 ? tokens.brand : error ? tokens.error : tokens.border,
    borderWidth: 1 + focus.value,
  }));

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View style={[styles.field, animatedBorder]}>
        {icon}
        <TextInput
          {...rest}
          placeholderTextColor={tokens.muted}
          style={[styles.input, style]}
          onFocus={(e) => {
            focus.value = withTiming(1, TIMING_FAST);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.value = withTiming(0, TIMING_FAST);
            onBlur?.(e);
          }}
        />
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: {
      gap: 6,
    },
    label: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.medium,
      color: tokens.sec,
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: tokens.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: tokens.border,
      paddingHorizontal: moderateScale(14),
      height: moderateScale(50),
    },
    input: {
      flex: 1,
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    error: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      color: tokens.error,
    },
  });
