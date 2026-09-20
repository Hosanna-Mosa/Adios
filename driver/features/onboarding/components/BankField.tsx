import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** One labelled bank-detail input. The caller owns the value rules
 * (digits only, uppercase, max length), so this stays presentational. */
export function BankField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "number-pad";
  autoCapitalize?: "none" | "characters";
}) {
  return (
    <Box style={styles.fieldGroup}>
      <AppText style={styles.label}>{label}</AppText>
      <Box style={styles.inputContainer}>
        <Feather name={icon} size={18} color={Colors.primary} />
        <AppTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </Box>
    </Box>
  );
}
