import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import { designTokens, elevation, gradients, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  /** A white pill on the right ("View"); without it a chevron is shown. */
  actionLabel?: string;
  /** Adds a close button. */
  onClose?: () => void;
  closeLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** A brand-gradient call-to-action card (orders waiting, new order received). */
export function GradientBanner({ icon, title, subtitle, onPress, actionLabel, onClose, closeLabel = "Close", style }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, style]} accessibilityRole="button" accessibilityLabel={title}>
      <LinearGradient colors={gradients[theme].brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={moderateScale(21)} color={tokens.onBrand} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : <Ionicons name="chevron-forward" size={20} color={tokens.onBrand} />}
      {onClose ? (
        <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={closeLabel}>
          <Ionicons name="close" size={moderateScale(18)} color={tokens.onBrand} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: radius.lg,
      paddingHorizontal: 16,
      paddingVertical: 14,
      overflow: "hidden",
      ...elevation.md,
    },
    iconCircle: {
      width: moderateScale(42),
      height: moderateScale(42),
      borderRadius: moderateScale(21),
      backgroundColor: "rgba(255,255,255,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    texts: { flex: 1, minWidth: 0 },
    title: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: tokens.onBrand },
    subtitle: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.onBrand, opacity: 0.9, marginTop: 2 },
    action: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      color: tokens.brand,
      backgroundColor: tokens.surface,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.pill,
      overflow: "hidden",
    },
  });
