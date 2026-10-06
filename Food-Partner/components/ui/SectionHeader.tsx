import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** The small uppercase section label used across the customer app, with an optional "See all" link. */
export function SectionHeader({ title, actionLabel, onAction, style }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={tokens.brand} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: tokens.muted,
    },
    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    actionText: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: typography.sizes.medium,
      color: tokens.brand,
    },
  });
