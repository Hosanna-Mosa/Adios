import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { Touchable } from "@/components/ui/Touchable";
import { Loader } from "@/components/ui/Loader";

/** Icon button that re-fetches a screen's live data; shows a spinner while busy. */
export function RefreshButton({
  onPress,
  refreshing,
  color = Colors.text,
  size = 20,
  style,
}: {
  onPress: () => void;
  refreshing: boolean;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  return (
    <Touchable
      onPress={onPress}
      disabled={refreshing}
      accessibilityRole="button"
      accessibilityLabel={t("actions.refresh")}
      accessibilityState={{ disabled: refreshing, busy: refreshing }}
      hitSlop={8}
      style={[{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }, style]}
    >
      {refreshing ? <Loader size="small" color={color} /> : <Feather name="refresh-cw" size={size} color={color} />}
    </Touchable>
  );
}
