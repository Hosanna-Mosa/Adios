import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { editFieldStyles as modalStyles } from "./EditField.styles";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Editable labelled field inside the profile edit modal. */
export function EditField({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  icon?: keyof typeof Feather.glyphMap;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
}) {
  return (
    <Box style={modalStyles.editFieldGroup}>
      <AppText style={modalStyles.fieldLabel}>{label}</AppText>
      <Box style={modalStyles.editFieldContainer}>
        {icon && <Feather name={icon} size={16} color={Colors.primary} />}
        <AppTextInput
          style={modalStyles.editInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "none"}
          secureTextEntry={secureTextEntry}
        />
      </Box>
    </Box>
  );
}
