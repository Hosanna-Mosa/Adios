import { useState } from "react";

export type IdentityFields = ReturnType<typeof useIdentityFields>;

export function useIdentityFields() {
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [consentAadhaar, setConsentAadhaar] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [panVerified, setPanVerified] = useState(false);
  const [consentPAN, setConsentPAN] = useState(false);
  /**
   * True when the identity above was read from DigiLocker rather than typed.
   * Those values are government-sourced and partly masked, so they must not be
   * edited or run through the manual format checks.
   */
  const [digilockerVerified, setDigilockerVerified] = useState(false);

  return {
    aadhaarNumber, setAadhaarNumber,
    aadhaarVerified, setAadhaarVerified,
    consentAadhaar, setConsentAadhaar,
    panNumber, setPanNumber,
    panName, setPanName,
    panVerified, setPanVerified,
    consentPAN, setConsentPAN,
    digilockerVerified, setDigilockerVerified,
  };
}
