import React from "react";
import { useTranslation } from "react-i18next";

import { DigiLockerField, DigiLockerPrompt } from "@/components/DigiLockerPrompt";
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
  const { t } = useTranslation();
  const formatOk = validatePANFormat(panNumber);
  return (
    <>
      <InfoBanner
        icon="info"
        text={t("onboarding.panDetailsCollectedForRecords")}
        type="info"
      />
      {panNumber.length > 0 && !formatOk && (
        <ValidationErrorBox message={t("onboarding.invalidPanNumber")} />
      )}
      {panName.length > 0 && panName.length < 3 && (
        <ValidationErrorBox message={t("onboarding.nameMustBeAtLeast3Characters")} />
      )}
      {formatOk && panName.length >= 3 && (
        <InfoBanner icon="check-circle" text={t("onboarding.validPanDetails")} type="success" />
      )}
    </>
  );
}

function VerifyForm() {
  const { t } = useTranslation();
  const { identity, saving, handleVerifyPAN, goToPrevSection } = useOnboardingCtx();
  return (
    <>
      <ConsentCheckbox
        checked={identity.consentPAN}
        onToggle={() => identity.setConsentPAN(!identity.consentPAN)}
        label={t("onboarding.consentPan")}
      />
      <PrimaryButton
        title={t("onboarding.verifyPan")}
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
      <AlternateIdLink label={t("onboarding.goBackToAadhaar")} onPress={goToPrevSection} />
    </>
  );
}

export function PanSection() {
  const { t } = useTranslation();
  const { identity } = useOnboardingCtx();

  if (identity.digilockerVerified) {
    return (
      <FieldColumn gap={16}>
        <DigiLockerPrompt verified />
        <DigiLockerField label={t("onboarding.panNumber")} value={identity.panNumber} />
        {!!identity.aadhaarNumber && (
          <DigiLockerField label={t("onboarding.aadhaarNumber")} value={identity.aadhaarNumber} />
        )}
      </FieldColumn>
    );
  }

  return (
    <FieldColumn gap={16}>
      <FormInput
        label={t("onboarding.panNumber")}
        value={identity.panNumber}
        onChangeText={(t) => identity.setPanNumber(t.toUpperCase().slice(0, 10))}
        placeholder="ABCDE1234F"
        autoCapitalize="characters"
        icon="file-text"
      />
      <FormInput
        label={t("onboarding.nameAsOnPanCard")}
        value={identity.panName}
        onChangeText={identity.setPanName}
        placeholder={t("onboarding.enterFullName")}
        autoCapitalize="words"
        icon="user"
      />
      {identity.aadhaarVerified ? (
        <FormalityNotes panNumber={identity.panNumber} panName={identity.panName} />
      ) : !identity.panVerified ? (
        <VerifyForm />
      ) : (
        <InfoBanner icon="check-circle" text={t("onboarding.panVerifiedSuccessfully")} type="success" />
      )}
    </FieldColumn>
  );
}
