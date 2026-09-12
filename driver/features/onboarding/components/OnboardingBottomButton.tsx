import React from "react";
import { View } from "react-native";

import { useOnboardingCtx } from "../OnboardingContext";
import { PrimaryButton } from "./PrimaryButton";

/** Sections that save, then advance one section within the same step. */
const SAVE_THEN_NEXT = ["gender", "vehicle", "zone", "aadhaar", "pan", "license", "bank"];

export function OnboardingBottomButton() {
  const {
    currentKey, nextSection, saving, docs,
    canProceedSection, saveCurrentSectionData, handleCompleteOnboarding,
    goToNextSection, goToNextStep,
  } = useOnboardingCtx();

  const nextLabel = nextSection?.label ? `Next — ${nextSection.label}` : "Continue";
  const ready = canProceedSection();

  if (currentKey === "selfie" && docs.selfieCaptured) {
    return (
      <PrimaryButton
        title="Complete & Activate"
        onPress={handleCompleteOnboarding}
        icon="check"
        loading={saving}
      />
    );
  }

  // Home address is the last section of step 1, so it advances the step.
  if (currentKey === "homeAddress" && ready) {
    return (
      <PrimaryButton
        title="Save & Continue"
        onPress={async () => {
          await saveCurrentSectionData();
          goToNextStep();
        }}
        icon="arrow-right"
        loading={saving}
      />
    );
  }

  if (currentKey && SAVE_THEN_NEXT.includes(currentKey) && ready) {
    const saveAndContinue = currentKey === "vehicle" || currentKey === "zone";
    return (
      <PrimaryButton
        title={saveAndContinue ? "Save & Continue" : nextLabel}
        onPress={async () => {
          await saveCurrentSectionData();
          goToNextSection();
        }}
        icon="arrow-right"
        loading={saving}
      />
    );
  }

  // Bank waits on verification; Aadhaar/PAN use their own inline skip links.
  if (currentKey === "bank" || currentKey === "aadhaar" || currentKey === "pan") {
    return <View />;
  }

  return (
    <PrimaryButton
      title="Continue"
      onPress={goToNextSection}
      disabled={!ready}
      icon="arrow-right"
    />
  );
}
