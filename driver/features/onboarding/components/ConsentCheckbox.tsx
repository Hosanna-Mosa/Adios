import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { consentStyles } from "./ConsentCheckbox.styles";

/** Tick-to-agree row used by the Aadhaar and PAN consent steps.
 * Was defined identically in both onboarding.tsx and identity-verify.tsx. */
export function ConsentCheckbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable onPress={onToggle} style={consentStyles.wrap}>
      <View style={[consentStyles.box, checked && consentStyles.boxChecked]}>
        {checked && <Feather name="check" size={14} color={Colors.white} />}
      </View>
      <Text style={consentStyles.label}>{label}</Text>
    </Pressable>
  );
}
