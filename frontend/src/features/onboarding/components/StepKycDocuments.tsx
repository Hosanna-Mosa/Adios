import { Icon } from "../../../components/shared/Icon";
import { FileUploader } from "../../../components/shared/FileUploader";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function StepKycDocuments({ form }: Props) {
  const {
    isMeatPartner, copy,
    panNumber, setPanNumber, panFile, setPanFile,
    gstin, setGstin, gstFile, setGstFile, gstExempt, setGstExempt,
    fssaiNumber, setFssaiNumber, fssaiExpiry, setFssaiExpiry, fssaiFile, setFssaiFile,
    bankAccount, setBankAccount, bankConfirm, setBankConfirm, accountType, setAccountType,
    ifsc, setIfsc, fetchBankDetails, ifscFetched, setIfscFetched, chequeFile, setChequeFile,
  } = form;
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1">Documents &amp; Legal Verification</h1>
          <p className="text-secondary-app text-sm">Upload the required documents to verify your business.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPanNumber("ABCDE1234F");
            setPanFile(new File(["dummy pan"], "pan_card_copy_dummy.png", { type: "image/png" }));
            setGstExempt(false);
            setGstin("22AAAAA0000A1Z5");
            setGstFile(new File(["dummy gst"], "gst_certificate_dummy.png", { type: "image/png" }));
            setFssaiNumber("12345678901234");
            setFssaiExpiry("2030-12-31");
            setFssaiFile(new File(["dummy fssai"], "fssai_license_dummy.png", { type: "image/png" }));
            setBankAccount("9876543210");
            setBankConfirm("9876543210");
            setAccountType("savings");
            setIfsc("HDFC0001234");
            setIfscFetched(true);
            setChequeFile(new File(["dummy cheque"], "cheque_statement_dummy.png", { type: "image/png" }));
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-kinetic/10 text-brand-kinetic hover:bg-brand-kinetic/20 rounded-xl text-sm font-semibold transition-all border border-brand-kinetic/20 shadow-sm"
        >
          <Icon name="auto_fix_high" className="text-lg" />
          Fill Step 3 Dummy Data
        </button>
      </div>

      {/* ── Section 3.1: Tax & Identity ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="badge" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">Tax &amp; Identity Verification</h2>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
          {/* PAN */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              PAN Card Details <span className="text-brand-kinetic">*</span>
            </label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm mb-3"
            />
            <FileUploader
              label="Upload PAN Card Copy"
              file={panFile}
              onChange={setPanFile}
            />
          </div>

          {/* GST */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold">
                GSTIN Details {!gstExempt && <span className="text-brand-kinetic">*</span>}
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
                  onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm mb-3"
                />
                <FileUploader
                  label="Upload GST Certificate"
                  file={gstFile}
                  onChange={setGstFile}
                />
              </>
            )}
            {gstExempt && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs font-medium text-blue-700">
                  Noted — your {isMeatPartner ? "meat center" : "restaurant"} is marked as GST exempt/composition scheme.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 3.2: Safety License ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="verified" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">{copy.safetyTitle}</h2>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                FSSAI License Number <span className="text-brand-kinetic">*</span>
              </label>
              <input
                type="text"
                value={fssaiNumber}
                onChange={(e) => setFssaiNumber(e.target.value.replace(/\D/g, "").slice(0, 14))}
                placeholder="14-digit license number"
                maxLength={14}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                FSSAI Expiry Date <span className="text-brand-kinetic">*</span>
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
            label="Upload FSSAI License Copy"
            desc={copy.safetyUploadDescription}
            required
            file={fssaiFile}
            onChange={setFssaiFile}
          />
        </div>
      </section>

      {/* ── Section 3.3: Banking & Payout Details ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="account_balance" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">Banking &amp; Payout Details</h2>
        </div>

        <div className="space-y-5 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Bank Account Number <span className="text-brand-kinetic">*</span>
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, "").slice(0, 18))}
                placeholder="Enter account number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Re-enter Account Number <span className="text-brand-kinetic">*</span>
              </label>
              <input
                type="text"
                value={bankConfirm}
                onChange={(e) => setBankConfirm(e.target.value.replace(/\D/g, "").slice(0, 18))}
                placeholder="Re-enter account number"
                className={`w-full px-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 transition-all text-sm ${
                  bankConfirm && bankAccount !== bankConfirm
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : bankConfirm && bankAccount === bankConfirm
                      ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                      : "border-gray-200 focus:border-brand-kinetic focus:ring-brand-kinetic/10"
                }`}
              />
              {bankConfirm && bankAccount !== bankConfirm && (
                <p className="text-xs text-red-500 mt-1">Account numbers do not match</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">Account Type <span className="text-brand-kinetic">*</span></label>
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
                Savings
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
                <Icon name="business" className="text-lg block mx-auto mb-1" />
                Current
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              IFSC Code <span className="text-brand-kinetic">*</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={ifsc}
                onChange={(e) => {
                  setIfsc(e.target.value.toUpperCase().slice(0, 11));
                  setIfscFetched(false);
                }}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
              />
              <button
                type="button"
                onClick={fetchBankDetails}
                disabled={ifsc.length !== 11}
                className="px-5 py-3 rounded-xl bg-brand-kinetic text-white text-sm font-semibold hover:bg-brand-kinetic/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Verify
              </button>
            </div>
            {ifscFetched && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                <Icon name="check_circle" className="text-base text-green-600" />
                <span className="text-xs font-medium text-green-700">IFSC verified — Bank details fetched successfully</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <FileUploader
              label="Upload Cancelled Cheque / Bank Statement"
              desc="Upload a clear image of your cancelled cheque or bank statement"
              required
              file={chequeFile}
              onChange={setChequeFile}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
