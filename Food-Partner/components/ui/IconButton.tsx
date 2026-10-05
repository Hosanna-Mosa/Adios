import React from "react";
import { StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  /** Diameter in dp before scaling. */
  size?: number;
  color?: string;
  background?: string;
  /** Shows a small dot, e.g. an unread indicator. */
  dot?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A round icon-only button — the header back chip's shape, for any action. */
export function IconButton({ icon, onPress, accessibilityLabel, size = 40, color, background, dot, disabled, style }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const d = moderateScale(size);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          width: d,
          height: d,
          borderRadius: d / 2,
          backgroundColor: background ?? tokens.surface,
          borderColor: tokens.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={d * 0.5} color={color ?? tokens.text} />
      {dot ? <View style={[styles.dot, { backgroundColor: tokens.error, borderColor: tokens.surface }]} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
