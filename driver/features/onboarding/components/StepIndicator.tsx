import React from "react";
import { Text, View } from "react-native";
import { indicatorStyles } from "./StepIndicator.styles";

/** "Step 1 of 2 — Work Settings" line above the onboarding form. */
export function StepIndicator({ step }: { step: 1 | 2 }) {
  const labels = ["Work Settings", "Verification"];
  return (
    <View style={indicatorStyles.wrap}>
      <Text style={indicatorStyles.label}>
        Step {step} of 2 — {labels[step - 1]}
      </Text>
    </View>
  );
}
