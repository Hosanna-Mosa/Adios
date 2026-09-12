import React from "react";
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

    if (currentKey === "aadhaar") {
      return (
        <FieldColumn gap={16}>
          <FormInput
            label="Aadhaar Number"
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
                text="Aadhaar details collected for records. PAN was used for identity verification."
                type="info"
              />
              {aadhaarNumber.replace(/\s/g, "").length > 0 &&
                (validateAadhaarFormat(aadhaarNumber.replace(/\s/g, "")) ? (
                  <InfoBanner icon="check-circle" text="Valid Aadhaar format" type="success" />
                ) : (
                  <ValidationErrorBox message="Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1." />
                ))}
            </>
          ) : !aadhaarVerified ? (
            /* ── Verify mode ── */
            <>
              <ConsentCheckbox
                checked={consentAadhaar}
                onToggle={() => setConsentAadhaar(!consentAadhaar)}
                label="I consent to share my Aadhaar details with Triozen for identity verification via third-party services (Surepass)."
              />
              <PrimaryButton
                title="Verify Aadhaar"
                onPress={handleVerifyAadhaar}
                disabled={aadhaarNumber.replace(/\s/g, "").length < 12 || !consentAadhaar || saving}
                loading={saving}
                icon="shield"
              />
              {!panVerified && (
                <AlternateIdLink label="Use PAN Card instead →" onPress={goNext} />
              )}
            </>
          ) : (
            <InfoBanner icon="check-circle" text="Aadhaar verified successfully!" type="success" />
          )}
        </FieldColumn>
      );
    }

    if (currentKey === "pan") {
      return (
        <FieldColumn gap={16}>
          <FormInput
            label="PAN Number"
            value={panNumber}
            onChangeText={(t) => setPanNumber(t.toUpperCase().slice(0, 10))}
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
            icon="file-text"
          />
          <FormInput
            label="Name as on PAN Card"
            value={panName}
            onChangeText={setPanName}
            placeholder="Enter full name"
            autoCapitalize="words"
            icon="user"
          />

          {aadhaarVerified ? (
            /* ── Formality mode — Aadhaar was already verified ── */
            <>
              <InfoBanner
                icon="info"
                text="PAN details collected for records. Aadhaar was used for identity verification."
                type="info"
              />
              {panNumber.length > 0 && !validatePANFormat(panNumber) && (
                <ValidationErrorBox message="Invalid PAN number. Format should be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)." />
              )}
              {panName.length > 0 && panName.length < 3 && (
                <ValidationErrorBox message="Name must be at least 3 characters." />
              )}
              {validatePANFormat(panNumber) && panName.length >= 3 && (
                <InfoBanner icon="check-circle" text="Valid PAN details" type="success" />
              )}
            </>
          ) : !panVerified ? (
            /* ── Verify mode ── */
            <>
              <ConsentCheckbox
                checked={consentPAN}
                onToggle={() => setConsentPAN(!consentPAN)}
                label="I consent to share my PAN details with Triozen for identity verification via third-party services (Surepass)."
              />
              <PrimaryButton
                title="Verify PAN"
                onPress={handleVerifyPAN}
                disabled={panNumber.length < 10 || panName.length < 3 || !consentPAN || saving}
                loading={saving}
                icon="shield"
              />
              {!aadhaarVerified && (
                <AlternateIdLink label="← Use Aadhaar instead" onPress={goPrev} />
              )}
            </>
          ) : (
            <InfoBanner icon="check-circle" text="PAN verified successfully!" type="success" />
          )}
        </FieldColumn>
      );
    }

  return null;
}
