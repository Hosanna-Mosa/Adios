import React from "react";

import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Confirmation-code box used at pickup and hand-over.
 * Six stages carried their own copy of this markup. */
export function OtpEntry({
  label,
  placeholder,
  value,
  onChangeText,
  hasError,
  errorText,
  maxLength = 8,
  style,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  hasError: boolean;
  errorText: string;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Box style={[styles.otpSection, style]}>
      <AppText style={styles.otpLabel}>{label}</AppText>
      <AppTextInput
        style={[styles.otpInput, hasError ? styles.otpInputError : null]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType="number-pad"
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
      />
      {hasError && <AppText style={styles.errorText}>{errorText}</AppText>}
    </Box>
  );
}
