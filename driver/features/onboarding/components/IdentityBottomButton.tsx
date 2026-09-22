import React from "react";

import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "./PrimaryButton";
import { Box } from "@/components/ui/Box";

/** Which action the identity screen offers next.
 *
 * The rules are subtle: once one ID is verified the other becomes a formality,
 * so the button says Done rather than Next. Kept exactly as it was. */
export function IdentityBottomButton({
  currentKey,
  sectionIdx,
  visibleSections,
  aadhaarVerified,
  panVerified,
  canProceedSection,
  canProceedAadhaar,
  canProceedPAN,
  goNext,
  totalSections,
}: any) {
    const { t } = useTranslation();
    const oneVerified = aadhaarVerified || panVerified;

    if (oneVerified && totalSections === 1) {
      // Only one section left (the other was already verified and filtered out)
      // or both are on the same section — user is done
      if (currentKey === "aadhaar" && panVerified && !canProceedAadhaar()) {
        return <Box />;
      }
      if (currentKey === "pan" && aadhaarVerified && !canProceedPAN()) {
        return <Box />;
      }
      // If the formality-mode fields are valid, show Done
      if (canProceedSection()) {
        return (
          <PrimaryButton
            title={t("actions.done")}
            onPress={() => router.back()}
            icon="check"
          />
        );
      }
      return <Box />;
    }

    if (currentKey === "aadhaar" && aadhaarVerified) {
      return (
        <PrimaryButton
          title={`${t("onboarding.next")} — ${visibleSections[sectionIdx + 1]?.label || t("onboarding.sections.pan")}`}
          onPress={goNext}
          icon="arrow-right"
        />
      );
    }

    if (currentKey === "pan" && panVerified) {
      return (
        <PrimaryButton
          title={t("actions.done")}
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    if (currentKey === "aadhaar" && canProceedAadhaar() && panVerified) {
      // Formality mode: Aadhaar fields filled, PAN already verified → show Done
      return (
        <PrimaryButton
          title={t("actions.done")}
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    if (currentKey === "pan" && canProceedPAN() && aadhaarVerified) {
      // Formality mode: PAN fields filled, Aadhaar already verified → show Done
      return (
        <PrimaryButton
          title={t("actions.done")}
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    // Default: hide bottom bar for verify-mode sections (inline verify button handles it)
    return <Box />;
}
