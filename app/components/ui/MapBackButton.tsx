import React from "react";
import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import { designTokens, elevation } from "@/constants/colors";
import { WEB_TOP_OFFSET } from "@/constants/layout";
import { useThemeStore } from "@/contexts/themeStore";

const SIZE = 44;

/** Where map screens put their top controls: the same height on every ride screen. */
export function mapControlTop(insets: EdgeInsets) {
  return insets.top + WEB_TOP_OFFSET + 12;
}

interface Props {
  onPress: () => void;
  /** Floats at the top-left of a full-screen map. Omit when the button sits in a row of controls. */
  absolute?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The back button over the ride flow's maps. Ride searching, pickup confirmation,
 * finding driver, ride confirmation and tracking each drew their own — 44pt with an
 * arrow, 42pt with an arrow, ~40pt with a bordered chevron — at a different top
 * offset each time. This is the one size, icon, shadow and offset for all of them.
 */
export function MapBackButton({ onPress, absolute, style }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t("app.a11y.goBack")}
      style={[
        styles.button,
        { backgroundColor: tokens.surface, borderColor: tokens.border },
        absolute && { position: "absolute", left: 16, top: mapControlTop(insets), zIndex: 10 },
        style,
      ]}
    >
      <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...elevation.md,
  },
});
