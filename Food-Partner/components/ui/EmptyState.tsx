import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { fadeInUp } from "@/motion/presets";
import { Button } from "./Button";

interface Props {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  /** Tighter padding for use inside a card. */
  compact?: boolean;
}

/** Icon + title + subtitle + optional action — the customer app's EmptyState (minus Lottie, which this app doesn't ship). */
export function EmptyState({ title, subtitle, icon = "file-tray-outline", actionLabel, onAction, compact }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);

  return (
    <Animated.View entering={fadeInUp(0)} style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={moderateScale(30)} color={tokens.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" size="sm" style={styles.action} />
      ) : null}
    </Animated.View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: moderateScale(48),
      paddingHorizontal: moderateScale(32),
      gap: 6,
    },
    compact: {
      paddingVertical: moderateScale(24),
      paddingHorizontal: moderateScale(16),
    },
    iconCircle: {
      width: moderateScale(68),
      height: moderateScale(68),
      borderRadius: moderateScale(34),
      backgroundColor: tokens.sunken,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    title: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
      color: tokens.text,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      textAlign: "center",
    },
    action: {
      marginTop: 12,
    },
  });
