import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface BadgeProps {
  label: string;
  tone?: "brand" | "success" | "warning" | "error" | "neutral";
}

/** Small, non-interactive status pill. */
export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createBadgeStyles(tokens), [theme, tokens]);
  const toneStyle = toneStyles(tokens)[tone];

  return (
    <View style={[styles.base, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.label, { color: toneStyle.fg }]}>{label}</Text>
    </View>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

/** Interactive filter/tag chip — used in cuisine rows, filter sheets. */
export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createChipStyles(tokens), [theme, tokens]);

  return (
    <Pressable onPress={onPress} style={[styles.base, selected && styles.selected]}>
      {icon}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const toneStyles = (tokens: ThemeTokens) => ({
  brand: { bg: `${tokens.brand}1F`, fg: tokens.brand },
  success: { bg: tokens.successSkin, fg: tokens.success },
  warning: { bg: tokens.warningSkin, fg: tokens.warning },
  error: { bg: tokens.errorSkin, fg: tokens.error },
  neutral: { bg: tokens.sunken, fg: tokens.sec },
});

const createBadgeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    base: {
      alignSelf: "flex-start",
      borderRadius: radius.sm,
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
    },
    label: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      letterSpacing: 0.4,
      textTransform: "uppercase",
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
    selected: {
      backgroundColor: tokens.brand,
      borderColor: tokens.brand,
    },
    label: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    labelSelected: {
      color: tokens.onBrand,
    },
  });
