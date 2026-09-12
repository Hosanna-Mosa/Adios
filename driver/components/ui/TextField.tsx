import React from "react";
import { StyleSheet, TextInputProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { Colors, radius } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { TIMING_FAST } from "@/motion/presets";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

/** Mirrors app/components/ui/TextField.tsx. */
export function TextField({ label, error, icon, style, onFocus, onBlur, ...rest }: Props) {
  const focus = useSharedValue(0);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: focus.value > 0.5 ? Colors.brand : error ? Colors.error : Colors.border,
    borderWidth: 1 + focus.value,
  }));

  return (
    <Box style={styles.wrap}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <Animated.View style={[styles.field, animatedBorder]}>
        {icon}
        <AppTextInput
          {...rest}
          placeholderTextColor={Colors.textMuted}
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
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: moderateScale(14),
    height: moderateScale(50),
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.body.regular,
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  error: {
    fontFamily: fontFamilies.body.medium,
    fontSize: typography.sizes.small,
    color: Colors.error,
  },
});
