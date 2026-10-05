import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  /** Bold primary line instead of secondary text. */
  strong?: boolean;
  /** Makes the row tappable (e.g. call a phone number) and tints it. */
  onPress?: () => void;
}

/** One "icon + line of text" detail, as in an order's customer block. */
export function InfoRow({ icon, text, strong, onPress }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const content = (
    <>
      <Ionicons name={icon} size={16} color={onPress ? tokens.brand : tokens.muted} style={styles.icon} />
      <Text style={[styles.text, strong && styles.strong, onPress && { color: tokens.brand }]}>{text}</Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={styles.row}>{content}</View>;
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    icon: {
      marginTop: 2,
    },
    text: {
      flex: 1,
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
    },
    strong: {
      fontFamily: fontFamilies.body.semibold,
      color: tokens.text,
    },
  });
