import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { FileUploader } from "../../../components/shared/FileUploader";
import type { PartnerCopy } from "../constants";
import type { KycDocuments } from "../hooks/useKycDocuments";
import type { KycSection } from "../types";
import { DigilockerVerificationCard } from "./DigilockerVerificationCard";
import { IFSC_PATTERN } from "../hooks/useKycDocuments";

const ALL_SECTIONS: KycSection[] = ["identity", "pan", "gst", "fssai", "bank"];

type Props = {
  docs: KycDocuments;
  isMeatPartner: boolean;
  copy: PartnerCopy;
  /** Pre-fills DigiLocker's sign-in screen. */
  ownerPhone?: string;
  /** Only these groups are shown — the resubmission page passes what an admin asked for. */
  sections?: KycSection[];
  /** The resubmission page renders its own heading. */
  showHeading?: boolean;
};

export function StepKycDocuments({
  docs,
  isMeatPartner,
  copy,
  ownerPhone,
  sections = ALL_SECTIONS,
  showHeading = true,
}: Props) {
  const { t } = useTranslation();
  const show = (section: KycSection) => sections.includes(section);
  const {
    digilocker,
    panVerifiedViaDigilocker,
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
  } = docs;
  return (
    <div>
      {showHeading && (
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1">
            {t("onboarding.documentsAndLegalVerification")}
          </h1>
          <p className="text-secondary-app text-sm">
            {t("onboarding.uploadRequiredDocuments")}
          </p>
        </div>
      )}

      {/* ── Section 3.0: Owner identity via DigiLocker ── */}
      {show("identity") && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
              <Icon
                name="verified_user"
                className="text-base text-brand-kinetic"
              />
            </div>
            <h2 className="font-display text-lg font-bold">
              {t(
                "onboarding.digilocker.sectionTitle",
                "Owner identity (DigiLocker)",
              )}{" "}
              <span className="text-brand-kinetic">*</span>
            </h2>
          </div>
          <DigilockerVerificationCard
            verification={digilocker}
            ownerPhone={ownerPhone}
          />
        </section>
      )}

      {/* ── Section 3.1: Tax & Identity ── */}
      {(show("pan") || show("gst")) && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
              <Icon name="badge" className="text-base text-brand-kinetic" />
            </div>
            <h2 className="font-display text-lg font-bold">
              {t("onboarding.taxAndIdentityVerification")}
            </h2>
          </div>

          <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
            {/* PAN */}
            {show("pan") && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("onboarding.panCardDetails")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) =>
                    setPanNumber(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 10),
                    )
                  }
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm mb-3"
                />
                {panVerifiedViaDigilocker ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                    <Icon
                      name="check_circle"
                      className="text-base text-green-600"
                    />
                    <span className="text-xs font-medium text-green-700">
                      {t(
                        "onboarding.digilocker.panVerified",
                        "PAN verified with DigiLocker — no copy needed.",
                      )}
                    </span>
                  </div>
                ) : (
                  <>
                    {digilocker.kyc?.panNumber && (
                      <p className="text-xs text-amber-700 mb-2">
                        {t(
                          "onboarding.digilocker.panDiffers",
                          "This PAN differs from the owner's DigiLocker PAN, so please upload a copy for manual review.",
                        )}
                      </p>
                    )}
                    <FileUploader
                      label={t("onboarding.uploadPanCardCopy")}
                      required
                      file={panFile}
                      onChange={setPanFile}
                    />
                  </>
                )}
              </div>
            )}

            {/* GST */}
            {show("gst") && (
              <div
                className={show("pan") ? "border-t border-gray-100 pt-5" : ""}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold">
                    {t("onboarding.gstinDetails")}{" "}
                    {!gstExempt && (
                      <span className="text-brand-kinetic">*</span>
                    )}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-secondary-app cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gstExempt}
                      onChange={() => setGstExempt(!gstExempt)}
                      className="accent-brand-kinetic"
                    />
                    {copy.gstExemptLabel}
                  </label>
                </div>
                {!gstExempt && (
                  <>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) =>
                        setGstin(e.target.value.toUpperCase().slice(0, 15))
                      }
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      maxLength={15}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm mb-3"
                    />
                    <FileUploader
                      label={t("onboarding.uploadGstCertificate")}
                      file={gstFile}
                      onChange={setGstFile}
                    />
                  </>
                )}
                {gstExempt && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-xs font-medium text-blue-700">
                      {t("onboarding.gstExemptNoted", {
                        value: isMeatPartner
                          ? t("onboarding.meatCenterLower")
                          : t("onboarding.restaurantLower"),
                        defaultValue:
                          "Noted — your {{value}} is marked as GST exempt/composition scheme.",
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Section 3.2: Safety License ── */}
      {show("fssai") && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
              <Icon name="verified" className="text-base text-brand-kinetic" />
            </div>
            <h2 className="font-display text-lg font-bold">
              {copy.safetyTitle}
            </h2>
          </div>

          <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("onboarding.fssaiLicenseNumber")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) =>
                    setFssaiNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 14),
                    )
                  }
                  placeholder={t("onboarding.fourteenDigitLicenseNumber")}
                  maxLength={14}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("onboarding.fssaiExpiryDate")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="date"
                  value={fssaiExpiry}
                  onChange={(e) => setFssaiExpiry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
                />
              </div>
            </div>

            <FileUploader
              label={t("onboarding.uploadFssaiLicenseCopy")}
              desc={copy.safetyUploadDescription}
              required
              file={fssaiFile}
              onChange={setFssaiFile}
            />
          </div>
        </section>
      )}

      {/* ── Section 3.3: Banking & Payout Details ── */}
      {show("bank") && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
              <Icon
                name="account_balance"
                className="text-base text-brand-kinetic"
              />
            </div>
            <h2 className="font-display text-lg font-bold">
              {t("onboarding.bankingAndPayoutDetails")}
            </h2>
          </div>

          <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("onboarding.bankAccountNumber")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) =>
                    setBankAccount(
                      e.target.value.replace(/\D/g, "").slice(0, 18),
                    )
                  }
                  placeholder={t("onboarding.enterAccountNumber")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t("onboarding.reEnterAccountNumber")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="text"
                  value={bankConfirm}
                  onChange={(e) =>
                    setBankConfirm(
                      e.target.value.replace(/\D/g, "").slice(0, 18),
                    )
                  }
                  placeholder={t("onboarding.reEnterAccountNumberPlaceholder")}
                  className={`w-full px-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 transition-all text-sm ${
                    bankConfirm && bankAccount !== bankConfirm
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : bankConfirm && bankAccount === bankConfirm
                        ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                        : "border-gray-200 focus:border-brand-kinetic focus:ring-brand-kinetic/10"
                  }`}
                />
                {bankConfirm && bankAccount !== bankConfirm && (
                  <p className="text-xs text-red-500 mt-1">
                    {t("onboarding.accountNumbersDoNotMatch")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">
                {t("onboarding.accountType")}{" "}
                <span className="text-brand-kinetic">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("savings")}
                  className={`flex-1 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    accountType === "savings"
                      ? "bg-brand-kinetic text-white border-brand-kinetic"
                      : "bg-white text-secondary-app border-gray-200 hover:border-brand-kinetic/30"
                  }`}
                >
                  <Icon name="savings" className="text-lg block mx-auto mb-1" />
                  {t("onboarding.savings")}
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("current")}
                  className={`flex-1 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    accountType === "current"
                      ? "bg-brand-kinetic text-white border-brand-kinetic"
                      : "bg-white text-secondary-app border-gray-200 hover:border-brand-kinetic/30"
                  }`}
                >
                  <Icon
                    name="business"
                    className="text-lg block mx-auto mb-1"
                  />
                  {t("onboarding.current")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.ifscCode")}{" "}
                <span className="text-brand-kinetic">*</span>
              </label>
              {/* Bank details are checked by an admin during verification. */}
              <input
                type="text"
                value={ifsc}
                onChange={(e) =>
                  setIfsc(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 11),
                  )
                }
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
              {ifsc.length === 11 && !IFSC_PATTERN.test(ifsc) && (
                <p className="text-xs text-red-500 mt-1">
                  {t(
                    "onboarding.invalidIfsc",
                    "Enter a valid IFSC code (e.g. HDFC0001234).",
                  )}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5">
              <FileUploader
                label={t("onboarding.uploadCancelledCheque")}
                desc={t("onboarding.uploadCancelledChequeDesc")}
                required
                file={chequeFile}
                onChange={setChequeFile}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
