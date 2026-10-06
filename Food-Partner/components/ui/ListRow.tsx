import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  label: string;
  description?: string;
  /** Ionicon shown in the leading tile. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Replaces the icon tile entirely, e.g. a letter or an avatar. */
  leading?: React.ReactNode;
  onPress?: () => void;
  /** Icon tile colours. Default: neutral sunken tile. */
  iconColor?: string;
  iconBackground?: string;
  /** Replaces the chevron, e.g. a switch, a price or a radio mark. */
  right?: React.ReactNode;
  /** Red label for destructive rows (Sign out). */
  destructive?: boolean;
  /** Standalone bordered card instead of a row inside a grouped card. */
  card?: boolean;
  /** Highlighted with the brand colour, for a chosen option. */
  selected?: boolean;
  /** Draws the hairline under the row inside a grouped card. */
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Icon tile + label + description + chevron. Generalised from the customer
 * app's SupportContactRow and profile menu rows, which were the same row with
 * a different icon, tint and action. Every tappable list row in the app is this.
 */
export function ListRow({
  label,
  description,
  icon,
  leading,
  onPress,
  iconColor,
  iconBackground,
  right,
  destructive,
  card,
  selected,
  divider,
  style,
}: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const fg = destructive ? tokens.error : (iconColor ?? tokens.sec);
  const bg = destructive ? tokens.errorSkin : (iconBackground ?? tokens.sunken);

  return (
    <TouchableOpacity
      style={[styles.row, (card || selected) && styles.card, selected && styles.selected, divider && styles.divider, style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={selected !== undefined ? { selected } : undefined}
    >
      {leading ??
        (icon ? (
          <View style={[styles.iconTile, { backgroundColor: bg }]}>
            <Ionicons name={icon} size={moderateScale(18)} color={fg} />
          </View>
        ) : null)}
      <View style={styles.texts}>
        <Text style={[styles.label, destructive && { color: tokens.error }]} numberOfLines={1}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {right !== undefined ? right : onPress ? <Ionicons name="chevron-forward" size={18} color={tokens.muted} /> : null}
    </TouchableOpacity>
  );
}

/** Square tile for a ListRow's `leading` slot, holding a glyph or letter instead of an icon. */
export function LeadingTile({ children, active }: { children: React.ReactNode; active?: boolean }) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  return (
    <View style={[styles.iconTile, { backgroundColor: active ? tokens.brand : tokens.sunken }]}>
      <Text style={[styles.leadingText, { color: active ? tokens.onBrand : tokens.sec }]}>{children}</Text>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      minHeight: moderateScale(62),
    },
    card: {
      backgroundColor: tokens.surface,
      borderWidth: 1.5,
      borderColor: tokens.border,
      borderRadius: radius.md,
    },
    selected: {
      borderColor: tokens.brand,
      backgroundColor: tokens.brandSkin,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
    },
    iconTile: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    leadingText: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
    },
    texts: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
    description: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.sec,
      marginTop: 2,
    },
  });
