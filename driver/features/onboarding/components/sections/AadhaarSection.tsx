import React from "react";

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
  const digits = aadhaarNumber.replace(/\s/g, "");
  return (
    <>
      <InfoBanner
        icon="info"
        text="Aadhaar details collected for records. PAN was used for identity verification."
        type="info"
      />
      {digits.length > 0 &&
        (validateAadhaarFormat(digits) ? (
          <InfoBanner icon="check-circle" text="Valid Aadhaar format" type="success" />
        ) : (
          <ValidationErrorBox message="Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1." />
        ))}
    </>
  );
}

function VerifyForm() {
  const { identity, saving, handleVerifyAadhaar, goToNextSection } = useOnboardingCtx();
  return (
    <>
      <ConsentCheckbox
        checked={identity.consentAadhaar}
        onToggle={() => identity.setConsentAadhaar(!identity.consentAadhaar)}
        label="I consent to share my Aadhaar details with Triozen for identity verification via third-party services (Surepass)."
      />
      <PrimaryButton
        title="Verify Aadhaar"
        onPress={handleVerifyAadhaar}
        disabled={
          identity.aadhaarNumber.replace(/\s/g, "").length < 12 ||
          !identity.consentAadhaar ||
          saving
        }
        loading={saving}
        icon="shield"
      />
      <AlternateIdLink label="Skip, I&apos;ll use PAN card →" onPress={goToNextSection} />
    </>
  );
}

export function AadhaarSection() {
  const { identity } = useOnboardingCtx();

  return (
    <FieldColumn gap={16}>
      <FormInput
        label="Aadhaar Number"
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
        <InfoBanner icon="check-circle" text="Aadhaar verified successfully!" type="success" />
      )}
    </FieldColumn>
  );
}
