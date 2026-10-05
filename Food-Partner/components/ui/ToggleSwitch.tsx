import React from "react";
import { Platform, Switch } from "react-native";
import * as Haptics from "expo-haptics";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Track colour when on. Defaults to the success green ("in stock"). */
  onColor?: string;
}

/** The platform switch, themed with the design tokens and a light haptic tick. */
export function ToggleSwitch({ value, onValueChange, disabled, accessibilityLabel, onColor }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const on = onColor ?? tokens.success;

  return (
    <Switch
      value={value}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      onValueChange={(next) => {
        Haptics.selectionAsync().catch(() => {});
        onValueChange(next);
      }}
      trackColor={{ false: tokens.borderStrong, true: on }}
      thumbColor={Platform.OS === "android" ? tokens.surface : undefined}
      ios_backgroundColor={tokens.borderStrong}
    />
  );
}
