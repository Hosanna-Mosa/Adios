import React from "react";

import { indicatorStyles } from "./StepIndicator.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** "Step 1 of 2 — Work Settings" line above the onboarding form. */
export function StepIndicator({ step }: { step: 1 | 2 }) {
  const labels = ["Work Settings", "Verification"];
  return (
    <Box style={indicatorStyles.wrap}>
      <AppText style={indicatorStyles.label}>
        Step {step} of 2 — {labels[step - 1]}
      </AppText>
    </Box>
  );
}
