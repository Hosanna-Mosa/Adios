import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

export type BadgeTone = "brand" | "success" | "warning" | "error" | "neutral" | "info" | "meat";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Shows a small dot before the label — used for "live" statuses. */
  dot?: boolean;
}

/** Small, non-interactive status pill. Same as the customer app's, plus an info tone and an optional icon/dot. */
export function Badge({ label, tone = "neutral", icon, dot }: BadgeProps) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createBadgeStyles(tokens), [tokens]);
  const toneStyle = badgeTones(tokens)[tone];

  return (
    <View style={[styles.base, { backgroundColor: toneStyle.bg }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: toneStyle.fg }]} /> : null}
      {icon ? <Ionicons name={icon} size={moderateScale(12)} color={toneStyle.fg} /> : null}
      <Text style={[styles.label, { color: toneStyle.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  /** Colour of the selected state. Defaults to the brand colour. */
  accent?: { accent: string; on: string };
}

/** Interactive filter/tag chip. */
export function Chip({ label, selected = false, onPress, icon, accent }: ChipProps) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createChipStyles(tokens), [tokens]);
  const fill = accent?.accent ?? tokens.brand;
  const onFill = accent?.on ?? tokens.onBrand;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.base, selected && { backgroundColor: fill, borderColor: fill }]}
    >
      {icon}
      <Text style={[styles.label, selected && { color: onFill }]}>{label}</Text>
    </Pressable>
  );
}

export const badgeTones = (tokens: ThemeTokens): Record<BadgeTone, { bg: string; fg: string }> => ({
  brand: { bg: tokens.brandSkin, fg: tokens.brand },
  success: { bg: tokens.successSkin, fg: tokens.success },
  warning: { bg: tokens.warningSkin, fg: tokens.warning },
  error: { bg: tokens.errorSkin, fg: tokens.error },
  neutral: { bg: tokens.sunken, fg: tokens.sec },
  info: { bg: tokens.infoSkin, fg: tokens.info },
  meat: { bg: tokens.services.meat.skin, fg: tokens.services.meat.accent },
});

const createBadgeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      alignSelf: "flex-start",
      borderRadius: radius.sm,
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      maxWidth: "100%",
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    label: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      flexShrink: 1,
    },
  });

const createChipStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: radius.pill,
      paddingHorizontal: moderateScale(14),
      height: moderateScale(36),
    },
    label: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
  });
