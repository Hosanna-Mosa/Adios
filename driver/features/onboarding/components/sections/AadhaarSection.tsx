import React from "react";
import { useTranslation } from "react-i18next";

import { DigiLockerDivider, DigiLockerField, DigiLockerPrompt } from "@/components/DigiLockerPrompt";
import { useOnboardingCtx } from "../../OnboardingContext";
import { validateAadhaarFormat } from "../../validators";
import { AlternateIdLink } from "../AlternateIdLink";
import { ConsentCheckbox } from "../ConsentCheckbox";
import { FieldColumn } from "../FieldColumn";
import { FormInput } from "../FormInput";
import { InfoBanner } from "../InfoBanner";
import { PrimaryButton } from "../PrimaryButton";
import { ValidationErrorBox } from "../ValidationErrorBox";

/** Aadhaar was not used for identity — we only collect it for the record. */
function FormalityNotes({ aadhaarNumber }: { aadhaarNumber: string }) {
  const { t } = useTranslation();
  const digits = aadhaarNumber.replace(/\s/g, "");
  return (
    <>
      <InfoBanner
        icon="info"
        text={t("onboarding.aadhaarDetailsCollectedForRecords")}
        type="info"
      />
      {digits.length > 0 &&
        (validateAadhaarFormat(digits) ? (
          <InfoBanner icon="check-circle" text={t("onboarding.validAadhaarFormat")} type="success" />
        ) : (
          <ValidationErrorBox message={t("onboarding.invalidAadhaarNumber")} />
        ))}
    </>
  );
}

function VerifyForm() {
  const { t } = useTranslation();
  const { identity, saving, handleVerifyAadhaar, goToNextSection } = useOnboardingCtx();
  return (
    <>
      <ConsentCheckbox
        checked={identity.consentAadhaar}
        onToggle={() => identity.setConsentAadhaar(!identity.consentAadhaar)}
        label={t("onboarding.consentAadhaar")}
      />
      <PrimaryButton
        title={t("onboarding.verifyAadhaar")}
        onPress={handleVerifyAadhaar}
        disabled={
          identity.aadhaarNumber.replace(/\s/g, "").length < 12 ||
          !identity.consentAadhaar ||
          saving
        }
        loading={saving}
        icon="shield"
      />
      <AlternateIdLink label={t("onboarding.skipIllUsePanCard")} onPress={goToNextSection} />
    </>
  );
}

export function AadhaarSection() {
  const { t } = useTranslation();
  const { identity } = useOnboardingCtx();

  // Read from the government record — nothing to type, and nothing to
  // validate. The stored number is masked, so running it through the
  // manual 12-digit check would show a permanent "invalid" error.
  if (identity.digilockerVerified) {
    return (
      <FieldColumn gap={16}>
        <DigiLockerPrompt verified />
        <DigiLockerField label={t("onboarding.aadhaarNumber")} value={identity.aadhaarNumber} />
        {!!identity.panNumber && (
          <DigiLockerField label={t("onboarding.panNumber")} value={identity.panNumber} />
        )}
        <InfoBanner
          icon="shield"
          text={t("onboarding.aadhaarLast4Stored", "Only the last 4 digits of your Aadhaar are stored.")}
          type="info"
        />
      </FieldColumn>
    );
  }

  return (
    <FieldColumn gap={16}>
      {!identity.aadhaarVerified && !identity.panVerified && (
        <>
          <DigiLockerPrompt returnTo="/onboarding" />
          <DigiLockerDivider />
        </>
      )}

      <FormInput
        label={t("onboarding.aadhaarNumber")}
        value={identity.aadhaarNumber}
        onChangeText={(t) => {
          const cleaned = t.replace(/[^0-9]/g, "").slice(0, 12);
          identity.setAadhaarNumber(cleaned.replace(/(\d{4})(?=\d)/g, "$1 "));
        }}
        placeholder="XXXX XXXX XXXX"
        keyboardType="number-pad"
        maxLength={14}
        icon="credit-card"
      />
      {identity.panVerified ? (
        <FormalityNotes aadhaarNumber={identity.aadhaarNumber} />
      ) : !identity.aadhaarVerified ? (
        <VerifyForm />
      ) : (
        <InfoBanner icon="check-circle" text={t("onboarding.aadhaarVerifiedSuccessfully")} type="success" />
      )}
    </FieldColumn>
  );
}
