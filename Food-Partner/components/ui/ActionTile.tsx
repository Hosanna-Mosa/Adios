import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  /** Icon colour and its tile background. Defaults to the brand pair. */
  color?: string;
  background?: string;
  /** Red count bubble in the corner, e.g. pending requests. Hidden at 0. */
  badge?: number;
  /** Dashed brand outline — an "add something" tile. */
  dashed?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A square shortcut tile: icon on top, label below (dashboard shortcuts, "Add photo"). */
export function ActionTile({ icon, label, onPress, color, background, badge, dashed, loading, disabled, style }: Props) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const fg = color ?? tokens.brand;
  const bg = background ?? tokens.brandSkin;

  return (
    <TouchableOpacity
      style={[styles.tile, dashed && styles.dashed, style]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          <View style={[styles.iconTile, { backgroundColor: dashed ? "transparent" : bg }]}>
            <Ionicons name={icon} size={moderateScale(dashed ? 24 : 19)} color={fg} />
          </View>
          <Text style={[styles.label, dashed && { color: fg }]} numberOfLines={2}>
            {label}
          </Text>
        </>
      )}
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    // Long-hand flex values so the dashed variant can switch them off cleanly
    // (a later `flex: 0` does not undo an earlier `flex: 1` basis everywhere).
    tile: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: radius.md,
      padding: 14,
      gap: 10,
      minHeight: moderateScale(104),
    },
    dashed: {
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: "auto",
      width: moderateScale(104),
      height: moderateScale(104),
      minHeight: undefined,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: tokens.brand,
      backgroundColor: tokens.brandSkin,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      padding: 8,
    },
    iconTile: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    label: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    badge: {
      position: "absolute",
      top: 12,
      right: 12,
      minWidth: moderateScale(22),
      height: moderateScale(22),
      borderRadius: moderateScale(11),
      paddingHorizontal: 6,
      backgroundColor: tokens.error,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: "#FFFFFF" },
  });
