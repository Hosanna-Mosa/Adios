import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { inputStyles } from "./FormInput.styles";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Labelled text field with an optional leading icon.
 * Was defined identically in both onboarding.tsx and identity-verify.tsx. */
export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  icon,
  autoCapitalize,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "phone-pad" | "email-address";
  maxLength?: number;
  icon?: keyof typeof Feather.glyphMap;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  /** Why the value is wrong; turns the border red and shows the text under the field. */
  error?: string;
}) {
  return (
    <Box style={inputStyles.group}>
      <AppText style={inputStyles.label}>{label}</AppText>
      <Box style={[inputStyles.container, error ? { borderColor: Colors.error } : null]}>
        {icon && <Feather name={icon} size={18} color={Colors.primary} />}
        <AppTextInput
          style={inputStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType || "default"}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize || "none"}
        />
      </Box>
      {error ? (
        <AppText size="small" color={Colors.error} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </Box>
  );
}
