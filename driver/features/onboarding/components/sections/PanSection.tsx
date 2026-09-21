import React from "react";

import { useOnboardingCtx } from "../../OnboardingContext";
import { validatePANFormat } from "../../validators";
import { AlternateIdLink } from "../AlternateIdLink";
import { ConsentCheckbox } from "../ConsentCheckbox";
import { FieldColumn } from "../FieldColumn";
import { FormInput } from "../FormInput";
import { InfoBanner } from "../InfoBanner";
import { PrimaryButton } from "../PrimaryButton";
import { ValidationErrorBox } from "../ValidationErrorBox";

/** PAN was not used for identity — we only collect it for the record. */
function FormalityNotes({ panNumber, panName }: { panNumber: string; panName: string }) {
  const formatOk = validatePANFormat(panNumber);
  return (
    <>
      <InfoBanner
        icon="info"
        text="PAN details collected for records. Aadhaar was used for identity verification."
        type="info"
      />
      {panNumber.length > 0 && !formatOk && (
        <ValidationErrorBox message="Invalid PAN number. Format should be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)." />
      )}
      {panName.length > 0 && panName.length < 3 && (
        <ValidationErrorBox message="Name must be at least 3 characters." />
      )}
      {formatOk && panName.length >= 3 && (
        <InfoBanner icon="check-circle" text="Valid PAN details" type="success" />
      )}
    </>
  );
}

function VerifyForm() {
  const { identity, saving, handleVerifyPAN, goToPrevSection } = useOnboardingCtx();
  return (
    <>
      <ConsentCheckbox
        checked={identity.consentPAN}
        onToggle={() => identity.setConsentPAN(!identity.consentPAN)}
        label="I consent to share my PAN details with Triozen for identity verification via third-party services (Surepass)."
      />
      <PrimaryButton
        title="Verify PAN"
        onPress={handleVerifyPAN}
        disabled={
          identity.panNumber.length < 10 ||
          identity.panName.length < 3 ||
          !identity.consentPAN ||
          saving
        }
        loading={saving}
        icon="shield"
      />
      <AlternateIdLink label="← Go back to Aadhaar" onPress={goToPrevSection} />
    </>
  );
}

export function PanSection() {
  const { identity } = useOnboardingCtx();

  return (
    <FieldColumn gap={16}>
      <FormInput
        label="PAN Number"
        value={identity.panNumber}
        onChangeText={(t) => identity.setPanNumber(t.toUpperCase().slice(0, 10))}
        placeholder="ABCDE1234F"
        autoCapitalize="characters"
        icon="file-text"
      />
      <FormInput
        label="Name as on PAN Card"
        value={identity.panName}
        onChangeText={identity.setPanName}
        placeholder="Enter full name"
        autoCapitalize="words"
        icon="user"
      />
      {identity.aadhaarVerified ? (
        <FormalityNotes panNumber={identity.panNumber} panName={identity.panName} />
      ) : !identity.panVerified ? (
        <VerifyForm />
      ) : (
        <InfoBanner icon="check-circle" text="PAN verified successfully!" type="success" />
      )}
    </FieldColumn>
  );
}
