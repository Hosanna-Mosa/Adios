import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { moderateScale } from "react-native-size-matters";
import { Colors, gradients, radius } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { usePressScale } from "@/motion/presets";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Primary/secondary/ghost/danger button with built-in press-scale + haptic feedback.
 * Mirrors app/components/ui/Button.tsx — same API, driver's cyan-teal brand. */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: Props) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.97);
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isDisabled) return;
    if (variant === "primary" || variant === "danger") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressIn();
  };

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? Colors.onBrand : Colors.brand} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              size === "sm" ? styles.labelSm : styles.label,
              variant === "secondary" || variant === "ghost" ? styles.labelOnSurface : styles.labelOnBrand,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.base,
        size === "sm" ? styles.baseSm : styles.baseMd,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "danger" && styles.danger,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {variant === "primary" && !isDisabled ? (
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: moderateScale(20),
  },
  baseMd: {
    height: moderateScale(52),
  },
  baseSm: {
    height: moderateScale(40),
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: Colors.error,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(16),
  },
  labelSm: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(14),
  },
  labelOnBrand: {
    color: Colors.onBrand,
  },
  labelOnSurface: {
    color: Colors.text,
  },
});
