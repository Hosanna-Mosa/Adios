import React from "react";

import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Labelled text field used by the contact section of the address form. */
export function AddressTextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <Box style={styles.inputGroup}>
      <AppText style={styles.inputLabel}>{label}</AppText>
      <AppTextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </Box>
  );
}
