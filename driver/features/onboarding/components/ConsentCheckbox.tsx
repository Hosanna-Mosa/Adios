import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { consentStyles } from "./ConsentCheckbox.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <PressBox onPress={onToggle} style={consentStyles.wrap}>
      <Box style={[consentStyles.box, checked && consentStyles.boxChecked]}>
        {checked && <Feather name="check" size={14} color={Colors.white} />}
      </Box>
      <AppText style={consentStyles.label}>{label}</AppText>
    </PressBox>
  );
}
