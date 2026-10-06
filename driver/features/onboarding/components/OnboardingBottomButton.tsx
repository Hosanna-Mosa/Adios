import React from "react";
import { useTranslation } from "react-i18next";

import { useOnboardingCtx } from "../OnboardingContext";
import { PrimaryButton } from "./PrimaryButton";
import { Box } from "@/components/ui/Box";

/** Sections that save, then advance one section within the same step. */
const SAVE_THEN_NEXT = ["email", "gender", "vehicle", "zone", "aadhaar", "pan", "license", "bank"];

export function OnboardingBottomButton() {
  const { t } = useTranslation();
  const {
    currentKey, nextSection, saving, docs,
    canProceedSection, saveCurrentSectionData, handleCompleteOnboarding,
    goToNextSection, goToNextStep, isReupload, isLastSection,
  } = useOnboardingCtx();

  const nextLabel = nextSection?.label ? `${t("onboarding.next")} — ${nextSection.label}` : t("actions.continue");
  const ready = canProceedSection();

  if (currentKey === "selfie" && docs.selfieCaptured) {
    return (
      <PrimaryButton
        title={isReupload ? t("verification.submitForReview", "Submit for review") : t("onboarding.completeAndActivate")}
        onPress={handleCompleteOnboarding}
        icon="check"
        loading={saving}
      />
    );
  }

  // Re-upload screen: the last requested document saves and resubmits.
  if (isReupload && isLastSection && currentKey !== "selfie" && ready) {
    return (
      <PrimaryButton
        title={t("verification.submitForReview", "Submit for review")}
        onPress={async () => {
          if (!(await saveCurrentSectionData())) return;
          await handleCompleteOnboarding();
        }}
        icon="check"
        loading={saving}
      />
    );
  }

  // Home address is the last section of step 1, so it advances the step.
  if (currentKey === "homeAddress" && ready) {
    return (
      <PrimaryButton
        title={t("onboarding.saveAndContinue")}
        onPress={async () => {
          if (!(await saveCurrentSectionData())) return;
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
        title={saveAndContinue ? t("onboarding.saveAndContinue") : nextLabel}
        onPress={async () => {
          if (!(await saveCurrentSectionData())) return;
          goToNextSection();
        }}
        icon="arrow-right"
        loading={saving}
      />
    );
  }

  // Bank waits on verification; Aadhaar/PAN use their own inline skip links.
  if (currentKey === "bank" || currentKey === "aadhaar" || currentKey === "pan") {
    return <Box />;
  }

  return (
    <PrimaryButton
      title={t("actions.continue")}
      onPress={goToNextSection}
      disabled={!ready}
      icon="arrow-right"
    />
  );
}
