import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { Button } from "./Button";

interface Props {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional Lottie JSON asset (e.g. require("@/assets/lottie/empty-cart.json")).
   * Falls back to the `icon` glyph when not provided — no bundled Lottie
   * animation assets ship with this redesign; drop real .json files in and
   * wire them up here per-screen when available. */
  lottieSource?: any;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, subtitle, icon = "file-tray-outline", lottieSource, actionLabel, onAction }: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [theme]);

  return (
    <View style={styles.wrap}>
      {lottieSource ? (
        <LottieView source={lottieSource} autoPlay loop style={styles.lottie} />
      ) : (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={moderateScale(32)} color={tokens.muted} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
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
    lottie: {
      width: moderateScale(140),
      height: moderateScale(140),
    },
    iconCircle: {
      width: moderateScale(72),
      height: moderateScale(72),
      borderRadius: moderateScale(36),
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
      color: tokens.sec,
      textAlign: "center",
    },
    action: {
      marginTop: 12,
    },
  });
