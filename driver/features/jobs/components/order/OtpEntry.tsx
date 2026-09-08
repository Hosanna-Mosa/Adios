import React from "react";
import { Text, TextInput, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";

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
    <View style={[styles.otpSection, style]}>
      <Text style={styles.otpLabel}>{label}</Text>
      <TextInput
        style={[styles.otpInput, hasError ? styles.otpInputError : null]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType="number-pad"
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
      />
      {hasError && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
}
