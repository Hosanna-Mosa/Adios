import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { fadeInDown } from "@/motion/presets";

interface Props {
  title: string;
  subtitle?: string;
  /** Trailing action, e.g. an "Add dish" Button. */
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** The large page heading at the top of a tab screen (Orders, Menu, Account…). */
export function ScreenTitle({ title, subtitle, right, style }: Props) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  return (
    <Animated.View entering={fadeInDown(0)} style={[styles.row, style]}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </Animated.View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
    texts: { flex: 1, minWidth: 0 },
    title: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: -0.4,
      color: tokens.text,
    },
    subtitle: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      marginTop: 4,
    },
  });
