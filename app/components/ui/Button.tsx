import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { moderateScale } from "react-native-size-matters";
import { designTokens, gradients, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
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

/** Primary/secondary/ghost/danger button with built-in press-scale + haptic feedback. */
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
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens, size), [theme, size]);
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
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? tokens.onBrand : tokens.brand} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, labelColor(styles, variant)]} numberOfLines={1}>
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
          colors={gradients[theme].brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {content}
    </AnimatedPressable>
  );
}

function labelColor(styles: ReturnType<typeof createStyles>, variant: Variant) {
  if (variant === "secondary" || variant === "ghost") return styles.labelOnSurface;
  return styles.labelOnBrand;
}

const createStyles = (tokens: ThemeTokens, size: Size) => {
  const height = size === "sm" ? moderateScale(40) : moderateScale(52);
  return StyleSheet.create({
    base: {
      height,
      borderRadius: radius.pill,
      backgroundColor: tokens.brand,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      paddingHorizontal: moderateScale(20),
    },
    secondary: {
      backgroundColor: tokens.surface,
      borderWidth: 1.5,
      borderColor: tokens.border,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    danger: {
      backgroundColor: tokens.error,
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
      fontSize: size === "sm" ? moderateScale(14) : moderateScale(16),
    },
    labelOnBrand: {
      color: tokens.onBrand,
    },
    labelOnSurface: {
      color: tokens.text,
    },
  });
};
