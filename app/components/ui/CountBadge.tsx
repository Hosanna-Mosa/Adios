import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { designTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface CountBadgeProps {
  count: number;
  /** Counts above this show as "max+" (default 99 → "99+"). */
  max?: number;
  /** Positioning, e.g. absolute top-right over an icon. */
  style?: StyleProp<ViewStyle>;
  /** Ring colour separating the badge from what's behind it; defaults to the page background. */
  ringColor?: string;
}

/**
 * Unread-count pill. Grows sideways for "12" / "99+" instead of squeezing the
 * digits into a fixed circle, and its height is sized to the smallest type
 * token (12dp text on a 16dp line) so the numbers are never clipped. Android's
 * extra font padding is turned off so the digits sit vertically centred.
 */
export function CountBadge({ count, max = 99, style, ringColor }: CountBadgeProps) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  if (count <= 0) return null;

  const label = count > max ? `${max}+` : String(count);

  return (
    <View
      style={[styles.badge, { backgroundColor: tokens.error, borderColor: ringColor ?? tokens.bg }, style]}
      accessibilityRole="text"
      accessibilityLabel={`${label} unread`}
    >
      <Text style={styles.label} numberOfLines={1} allowFontScaling={false}>
        {label}
      </Text>
    </View>
  );
}

const SIZE = moderateScale(20);

const styles = StyleSheet.create({
  badge: {
    minWidth: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    paddingHorizontal: moderateScale(5),
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    lineHeight: typography.lineHeights.small,
    color: "#fff",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
