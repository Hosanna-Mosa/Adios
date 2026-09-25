import React from "react";
import { useTranslation } from "react-i18next";
import { AlternateIdLink } from "./AlternateIdLink";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { FieldColumn } from "./FieldColumn";
import { FormInput } from "./FormInput";
import { InfoBanner } from "./InfoBanner";
import { PrimaryButton } from "./PrimaryButton";
import { ValidationErrorBox } from "./ValidationErrorBox";

/** The Aadhaar step or the PAN step, whichever is current. */
export function IdentitySection(props: any) {
  const {
    currentKey, saving,
    aadhaarNumber, setAadhaarNumber, aadhaarVerified, consentAadhaar, setConsentAadhaar,
    panNumber, setPanNumber, panName, setPanName, panVerified, consentPAN, setConsentPAN,
    validateAadhaarFormat, validatePANFormat,
    handleVerifyAadhaar, handleVerifyPAN, goNext, goPrev,
  } = props;
  const { t } = useTranslation();

    if (currentKey === "aadhaar") {
      return (
        <FieldColumn gap={16}>
          <FormInput
            label={t("onboarding.aadhaarNumber")}
            value={aadhaarNumber}
            onChangeText={(t) => {
              const cleaned = t.replace(/[^0-9]/g, "").slice(0, 12);
              const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
              setAadhaarNumber(formatted);
            }}
            placeholder="XXXX XXXX XXXX"
            keyboardType="number-pad"
            maxLength={14}
            icon="credit-card"
          />

          {panVerified ? (
            /* ── Formality mode — PAN was already verified ── */
            <>
              <InfoBanner
                icon="info"
                text={t("onboarding.aadhaarDetailsCollectedForRecords")}
                type="info"
              />
              {aadhaarNumber.replace(/\s/g, "").length > 0 &&
                (validateAadhaarFormat(aadhaarNumber.replace(/\s/g, "")) ? (
                  <InfoBanner icon="check-circle" text={t("onboarding.validAadhaarFormat")} type="success" />
                ) : (
                  <ValidationErrorBox message={t("onboarding.invalidAadhaarNumber")} />
                ))}
            </>
          ) : !aadhaarVerified ? (
            /* ── Verify mode ── */
            <>
              <ConsentCheckbox
                checked={consentAadhaar}
                onToggle={() => setConsentAadhaar(!consentAadhaar)}
                label={t("onboarding.consentAadhaar")}
              />
              <PrimaryButton
                title={t("onboarding.verifyAadhaar")}
                onPress={handleVerifyAadhaar}
                disabled={aadhaarNumber.replace(/\s/g, "").length < 12 || !consentAadhaar || saving}
                loading={saving}
                icon="shield"
              />
              {!panVerified && (
                <AlternateIdLink label={t("onboarding.usePanCardInstead")} onPress={goNext} />
              )}
            </>
          ) : (
            <InfoBanner icon="check-circle" text={t("onboarding.aadhaarVerifiedSuccessfully")} type="success" />
          )}
        </FieldColumn>
      );
    }

    if (currentKey === "pan") {
      return (
        <FieldColumn gap={16}>
          <FormInput
            label={t("onboarding.panNumber")}
            value={panNumber}
            onChangeText={(t) => setPanNumber(t.toUpperCase().slice(0, 10))}
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
            icon="file-text"
          />
          <FormInput
            label={t("onboarding.nameAsOnPanCard")}
            value={panName}
            onChangeText={setPanName}
            placeholder={t("onboarding.enterFullName")}
            autoCapitalize="words"
            icon="user"
          />

          {aadhaarVerified ? (
            /* ── Formality mode — Aadhaar was already verified ── */
            <>
              <InfoBanner
                icon="info"
                text={t("onboarding.panDetailsCollectedForRecords")}
                type="info"
              />
              {panNumber.length > 0 && !validatePANFormat(panNumber) && (
                <ValidationErrorBox message={t("onboarding.invalidPanNumber")} />
              )}
              {panName.length > 0 && panName.length < 3 && (
                <ValidationErrorBox message={t("onboarding.nameMustBeAtLeast3Characters")} />
              )}
              {validatePANFormat(panNumber) && panName.length >= 3 && (
                <InfoBanner icon="check-circle" text={t("onboarding.validPanDetails")} type="success" />
              )}
            </>
          ) : !panVerified ? (
            /* ── Verify mode ── */
            <>
              <ConsentCheckbox
                checked={consentPAN}
                onToggle={() => setConsentPAN(!consentPAN)}
                label={t("onboarding.consentPan")}
              />
              <PrimaryButton
                title={t("onboarding.verifyPan")}
                onPress={handleVerifyPAN}
                disabled={panNumber.length < 10 || panName.length < 3 || !consentPAN || saving}
                loading={saving}
                icon="shield"
              />
              {!aadhaarVerified && (
                <AlternateIdLink label={t("onboarding.useAadhaarInstead")} onPress={goPrev} />
              )}
            </>
          ) : (
            <InfoBanner icon="check-circle" text={t("onboarding.panVerifiedSuccessfully")} type="success" />
          )}
        </FieldColumn>
      );
    }

  return null;
}
