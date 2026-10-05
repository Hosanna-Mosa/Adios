import { useCallback } from "react";

import type { OnboardingSectionKey } from "../onboardingSections";
import { validateAadhaarFormat, validateDLFormat, validateEmailFormat, validatePANFormat } from "../validators";
import type { DocumentFields } from "./useDocumentFields";
import type { IdentityFields } from "./useIdentityFields";
import type { Step1Fields } from "./useStep1Fields";

/** "Can the driver move on from this section?" — one rule per section. */
export function useOnboardingGates(
  step1: Step1Fields,
  identity: IdentityFields,
  docs: DocumentFields,
  currentKey: OnboardingSectionKey | undefined,
) {
  // In formality mode the other ID is already verified, so we only need a
  // well-formed number for the records.
  // DigiLocker already proved the identity; the stored Aadhaar is masked and
  // would fail validateAadhaarFormat, which would strand the driver here.
  const canProceedAadhaar = useCallback(
    () =>
      identity.digilockerVerified ||
      (identity.panVerified
        ? validateAadhaarFormat(identity.aadhaarNumber.replace(/\s/g, ""))
        : identity.aadhaarVerified),
    [identity],
  );

  const canProceedPAN = useCallback(
    () =>
      identity.digilockerVerified ||
      (identity.aadhaarVerified
        ? validatePANFormat(identity.panNumber) && identity.panName.length >= 3
        : identity.panVerified),
    [identity],
  );

  const canProceedSection = useCallback((): boolean => {
    switch (currentKey) {
      case "email": return validateEmailFormat(step1.email);
      case "gender": return !!step1.gender;
      case "vehicle": return !!step1.vehicle;
      case "zone": return !!step1.preferredZone;
      case "homeAddress":
        return !!step1.homeAddressLine && step1.homeLat !== null && step1.homeLng !== null;
      case "aadhaar": return canProceedAadhaar();
      case "pan": return canProceedPAN();
      case "license":
        return docs.dlVerified || (validateDLFormat(docs.dlNumber) && !!docs.dlExpiry);
      case "bank": return docs.bankVerified;
      case "selfie": return docs.selfieCaptured;
      default: return false;
    }
  }, [currentKey, step1, docs, canProceedAadhaar, canProceedPAN]);

  return { canProceedAadhaar, canProceedPAN, canProceedSection };
}
