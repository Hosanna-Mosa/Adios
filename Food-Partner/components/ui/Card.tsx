import React from "react";
import { StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevationLevel?: "none" | "sm" | "md" | "lg";
  padding?: number;
  bordered?: boolean;
  /** Makes the whole card a button (e.g. an order in a list). */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Dashed border — a dimmed state such as "sold out". */
  dashed?: boolean;
}

/** Surface container with the shared radius/elevation tokens baked in — the customer app's Card, optionally pressable. */
export function Card({ children, style, elevationLevel = "sm", padding = 16, bordered = false, onPress, accessibilityLabel, dashed }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const frame = [
    styles.base,
    { padding },
    elevationLevel !== "none" && elevation[elevationLevel],
    (bordered || dashed) && styles.bordered,
    dashed && styles.dashed,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={frame} onPress={onPress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={frame}>{children}</View>;
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    base: {
      backgroundColor: tokens.surface,
      borderRadius: radius.lg,
    },
    bordered: {
      borderWidth: 1,
      borderColor: tokens.border,
    },
    dashed: {
      borderStyle: "dashed",
      borderColor: tokens.borderStrong,
    },
  });
