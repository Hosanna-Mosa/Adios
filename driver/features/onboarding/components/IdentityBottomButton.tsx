import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "./PrimaryButton";

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
    const oneVerified = aadhaarVerified || panVerified;

    if (oneVerified && totalSections === 1) {
      // Only one section left (the other was already verified and filtered out)
      // or both are on the same section — user is done
      if (currentKey === "aadhaar" && panVerified && !canProceedAadhaar()) {
        return <View />;
      }
      if (currentKey === "pan" && aadhaarVerified && !canProceedPAN()) {
        return <View />;
      }
      // If the formality-mode fields are valid, show Done
      if (canProceedSection()) {
        return (
          <PrimaryButton
            title="Done"
            onPress={() => router.back()}
            icon="check"
          />
        );
      }
      return <View />;
    }

    if (currentKey === "aadhaar" && aadhaarVerified) {
      return (
        <PrimaryButton
          title={`Next — ${visibleSections[sectionIdx + 1]?.label || "PAN Card"}`}
          onPress={goNext}
          icon="arrow-right"
        />
      );
    }

    if (currentKey === "pan" && panVerified) {
      return (
        <PrimaryButton
          title="Done"
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    if (currentKey === "aadhaar" && canProceedAadhaar() && panVerified) {
      // Formality mode: Aadhaar fields filled, PAN already verified → show Done
      return (
        <PrimaryButton
          title="Done"
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    if (currentKey === "pan" && canProceedPAN() && aadhaarVerified) {
      // Formality mode: PAN fields filled, Aadhaar already verified → show Done
      return (
        <PrimaryButton
          title="Done"
          onPress={() => router.back()}
          icon="check"
        />
      );
    }

    // Default: hide bottom bar for verify-mode sections (inline verify button handles it)
    return <View />;
}
