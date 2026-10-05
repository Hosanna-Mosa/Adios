import { useState } from "react";
import { useDigilockerVerification } from "./useDigilockerVerification";
import type { KycSection } from "../types";

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/**
 * State for the "Documents & Legal" step: owner identity via DigiLocker plus
 * PAN, GST, FSSAI and bank details. Shared by the onboarding form and the
 * resubmission page, which shows only the sections an admin asked for.
 *
 * `storedDigilockerPan` is the PAN from an identity DigiLocker verified on an
 * earlier submission, which still vouches for a matching PAN on resubmission.
 */
export function useKycDocuments(storedDigilockerPan?: string) {
  const [panNumber, setPanNumber] = useState("");
  const [panFile, setPanFile] = useState<File | null>(null);
  const [gstin, setGstin] = useState("");
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [gstExempt, setGstExempt] = useState(false);

  const [fssaiNumber, setFssaiNumber] = useState("");
  const [fssaiExpiry, setFssaiExpiry] = useState("");
  const [fssaiFile, setFssaiFile] = useState<File | null>(null);

  const [bankAccount, setBankAccount] = useState("");
  const [bankConfirm, setBankConfirm] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "current">(
    "savings",
  );
  const [ifsc, setIfsc] = useState("");
  const [chequeFile, setChequeFile] = useState<File | null>(null);

  // A PAN that DigiLocker returns is filled in for the owner; they can still
  // replace it (e.g. with a firm's PAN), which then needs an uploaded copy.
  const digilocker = useDigilockerVerification((kyc) => {
    if (kyc.panNumber) setPanNumber(kyc.panNumber);
  });

  const verifiedPan = digilocker.kyc
    ? digilocker.kyc.panNumber
    : storedDigilockerPan;
  const panVerifiedViaDigilocker = Boolean(
    verifiedPan && panNumber === verifiedPan,
  );

  const isSectionComplete = (section: KycSection) => {
    switch (section) {
      case "identity":
        return digilocker.status === "linked";
      case "pan":
        return (
          PAN_PATTERN.test(panNumber) &&
          (panVerifiedViaDigilocker || panFile !== null)
        );
      case "gst":
        return gstExempt || (gstin.length > 0 && gstFile !== null);
      case "fssai":
        return (
          fssaiNumber.length === 14 &&
          fssaiExpiry.length > 0 &&
          fssaiFile !== null
        );
      case "bank":
        return (
          bankAccount.length >= 9 &&
          bankAccount === bankConfirm &&
          IFSC_PATTERN.test(ifsc) &&
          chequeFile !== null
        );
    }
  };

  /** The step-3 fields as the backend expects them (files as names only). */
  const getDocumentsPayload = () => ({
    panNumber,
    panFile: panFile ? { name: panFile.name } : null,
    gstin,
    gstFile: gstFile ? { name: gstFile.name } : null,
    gstExempt,
    fssaiNumber,
    fssaiExpiry,
    fssaiFile: fssaiFile ? { name: fssaiFile.name } : null,
    bankAccount,
    bankConfirm,
    accountType,
    ifsc,
    chequeFile: chequeFile ? { name: chequeFile.name } : null,
    ...(digilocker.credentials || {}),
  });

  return {
    panNumber,
    setPanNumber,
    panFile,
    setPanFile,
    gstin,
    setGstin,
    gstFile,
    setGstFile,
    gstExempt,
    setGstExempt,
    fssaiNumber,
    setFssaiNumber,
    fssaiExpiry,
    setFssaiExpiry,
    fssaiFile,
    setFssaiFile,
    bankAccount,
    setBankAccount,
    bankConfirm,
    setBankConfirm,
    accountType,
    setAccountType,
    ifsc,
    setIfsc,
    chequeFile,
    setChequeFile,
    digilocker,
    panVerifiedViaDigilocker,
    isSectionComplete,
    getDocumentsPayload,
  };
}

export type KycDocuments = ReturnType<typeof useKycDocuments>;
