import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { badgeTones, type BadgeTone } from "./Badge";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  /** Small line under the value, e.g. "3 in progress". */
  hint?: string;
  tone?: BadgeTone;
  /** Makes the card a button (with a chevron), e.g. to open the list behind the figure. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** One figure on a dashboard: tinted icon tile, big value, label. */
export function StatCard({ icon, label, value, hint, tone = "brand", onPress, style }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const colors = badgeTones(tokens)[tone];

  const body = (
    <>
      <View style={[styles.iconTile, { backgroundColor: colors.bg }]}>
        <Ionicons name={icon} size={moderateScale(19)} color={colors.fg} />
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.muted} style={styles.chevron} />
      ) : null}
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </>
  );

  if (!onPress) return <View style={[styles.card, style]}>{body}</View>;
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      {body}
    </TouchableOpacity>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: tokens.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: tokens.border,
      padding: moderateScale(14),
      gap: 2,
      ...elevation.sm,
    },
    chevron: {
      position: "absolute",
      top: moderateScale(14),
      right: moderateScale(12),
    },
    iconTile: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: radius.sm + 2,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    value: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      color: tokens.text,
    },
    label: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.sec,
    },
    hint: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.muted,
      marginTop: 2,
    },
  });
