import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevationLevel?: "none" | "sm" | "md" | "lg";
  padding?: number;
  bordered?: boolean;
}

/** Surface container with the shared radius/elevation tokens baked in. */
export function Card({ children, style, elevationLevel = "sm", padding = 16, bordered = false }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [theme, tokens]);

  return (
    <View
      style={[
        styles.base,
        { padding },
        elevationLevel !== "none" && elevation[elevationLevel],
        bordered && styles.bordered,
        style,
      ]}
    >
      {children}
    </View>
  );
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
  });
