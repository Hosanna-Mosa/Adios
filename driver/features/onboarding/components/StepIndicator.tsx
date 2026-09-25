import React from "react";
import { useTranslation } from "react-i18next";

import { indicatorStyles } from "./StepIndicator.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** "Step 1 of 2 — Work Settings" line above the onboarding form. */
export function StepIndicator({ step }: { step: 1 | 2 }) {
  const { t } = useTranslation();
  const labels = [t("onboarding.workSettings"), t("onboarding.verification")];
  return (
    <Box style={indicatorStyles.wrap}>
      <AppText style={indicatorStyles.label}>
        {t("onboarding.stepXOf2", { value: step, defaultValue: "Step {{value}} of 2" })} — {labels[step - 1]}
      </AppText>
    </Box>
  );
}
