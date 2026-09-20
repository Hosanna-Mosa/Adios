import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { dlStyles } from "../onboarding.styles";
import { inputStyles } from "./FormInput.styles";
import { Touchable } from "@/components/ui/Touchable";
import { AppText } from "@/components/ui/AppText";

/** Why a typed licence number was rejected. */
export function LicenseFormatError({ message }: { message: React.ReactNode }) {
  return (
    <AppText style={dlStyles.errorText} accessibilityRole="alert">
      {message}
    </AppText>
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
      <AppText style={inputStyles.label}>{label}</AppText>
      <Touchable onPress={onPress} style={dlStyles.dateButton}>
        <Feather name="calendar" size={18} color={Colors.primary} />
        <AppText style={value ? dlStyles.dateText : dlStyles.datePlaceholder}>
          {value || placeholder}
        </AppText>
        {value ? <Feather name="check-circle" size={18} color={Colors.success} /> : null}
      </Touchable>
    </>
  );
}
