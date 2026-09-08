import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { bannerStyles } from "./InfoBanner.styles";

/** Inline success/info notice under a form field.
 * Both screens carried their own copy; the only difference was a base
 * background the inline style always overrode, so this renders identically. */
export function InfoBanner({
  icon,
  text,
  type,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  type?: "success" | "info";
}) {
  const bgColor = type === "success" ? Colors.successSkin : Colors.primaryLight;
  const txtColor = type === "success" ? Colors.successForest : Colors.primaryDark;
  const iconColor = type === "success" ? Colors.successForest : Colors.primary;
  return (
    <View style={[bannerStyles.banner, { backgroundColor: bgColor }]}>
      <Feather name={icon} size={16} color={iconColor} />
      <Text style={[bannerStyles.text, { color: txtColor }]}>{text}</Text>
    </View>
  );
}
