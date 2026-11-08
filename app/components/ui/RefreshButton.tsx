import React from "react";
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// Round icon button that re-fetches a live screen. Same chip as Header's back
// button; shows a spinner and stops responding while `refreshing`.

interface Props {
  onPress: () => void;
  refreshing?: boolean;
  /** Pass the translated "Refresh" label. */
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function RefreshButton({ onPress, refreshing = false, accessibilityLabel, style }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={onPress}
      disabled={refreshing}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: refreshing, busy: refreshing }}
    >
      {refreshing ? (
        <ActivityIndicator size="small" color={tokens.text} />
      ) : (
        <Ionicons name="refresh" size={moderateScale(18)} color={tokens.text} />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    btn: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      alignItems: "center",
      justifyContent: "center",
    },
  });
