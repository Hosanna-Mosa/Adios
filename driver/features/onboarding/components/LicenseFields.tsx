import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { dlStyles } from "../onboarding.styles";
import { inputStyles } from "./FormInput.styles";

/** Why a typed licence number was rejected. */
export function LicenseFormatError({ message }: { message: React.ReactNode }) {
  return (
    <Text style={dlStyles.errorText} accessibilityRole="alert">
      {message}
    </Text>
  );
}

/** Tappable field that opens the expiry date picker. */
export function ExpiryDateField({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <>
      <Text style={inputStyles.label}>{label}</Text>
      <TouchableOpacity onPress={onPress} style={dlStyles.dateButton}>
        <Feather name="calendar" size={18} color={Colors.primary} />
        <Text style={value ? dlStyles.dateText : dlStyles.datePlaceholder}>
          {value || placeholder}
        </Text>
        {value ? <Feather name="check-circle" size={18} color={Colors.success} /> : null}
      </TouchableOpacity>
    </>
  );
}
