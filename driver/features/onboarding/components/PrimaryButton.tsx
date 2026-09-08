import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { btnStyles } from "./PrimaryButton.styles";

/** Full-width pill action button for the onboarding forms.
 * Was defined identically in both onboarding.tsx and identity-verify.tsx. */
export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[btnStyles.button, disabled && btnStyles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <Text style={btnStyles.text}>Please wait...</Text>
      ) : (
        <>
          <Text style={btnStyles.text}>{title}</Text>
          {icon && <Feather name={icon} size={20} color={Colors.white} />}
        </>
      )}
    </TouchableOpacity>
  );
}
