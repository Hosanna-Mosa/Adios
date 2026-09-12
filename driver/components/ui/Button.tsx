import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Colors, gradients } from "@/constants/colors";
import { usePressScale } from "@/motion/presets";
import { styles } from "./Button.styles";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

interface Props {
  /** Button label. Optional when `children` or an icon-only button is used. */
  title?: string;
  /** Arbitrary content in place of the default icon + label row. */
  children?: React.ReactNode;
  /** Square icon button: drops the label and the horizontal padding. */
  iconOnly?: boolean;
  /** Required when `iconOnly`, since there is no visible label to read out. */
  accessibilityLabel?: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Primary/secondary/ghost/danger button with built-in press-scale + haptic feedback.
 * Mirrors app/components/ui/Button.tsx — same API, driver's cyan-teal brand. */
export function Button({
  title,
  children,
  iconOnly = false,
  accessibilityLabel,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  testID,
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
      ) : children ? (
        children
      ) : (
        <>
          {icon}
          {title ? (
          <Text
            style={[
              size === "sm" ? styles.labelSm : styles.label,
              variant === "secondary" || variant === "ghost" ? styles.labelOnSurface : styles.labelOnBrand,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          ) : null}
        </>
      )}
    </View>
  );

  return (
    <AnimatedPressable
      testID={testID}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        animatedStyle,
        styles.base,
        size === "sm" ? styles.baseSm : styles.baseMd,
        iconOnly && (size === "sm" ? styles.iconOnlySm : styles.iconOnlyMd),
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
