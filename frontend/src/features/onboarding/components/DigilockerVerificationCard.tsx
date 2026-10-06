import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import type { DigilockerVerification } from "../hooks/useDigilockerVerification";

type Props = {
  verification: DigilockerVerification;
  /** Pre-fills the mobile number on DigiLocker's sign-in screen. */
  ownerPhone?: string;
};

/** Owner identity verification through DigiLocker (consent runs in a popup). */
export function DigilockerVerificationCard({
  verification,
  ownerPhone,
}: Props) {
  const { t } = useTranslation();
  const { status, kyc, error, sandbox, start, reset } = verification;

  if (status === "linked" && kyc) {
    const rows = [
      {
        label: t("onboarding.digilocker.holderName", "Name"),
        value: kyc.holderName,
      },
      {
        label: t("onboarding.digilocker.aadhaar", "Aadhaar"),
        value: kyc.maskedAadhaar,
      },
      { label: t("onboarding.digilocker.pan", "PAN"), value: kyc.panNumber },
    ];

    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon name="verified_user" className="text-2xl text-green-600" />
            <div>
              <p className="text-sm font-bold text-green-800">
                {t(
                  "onboarding.digilocker.verified",
                  "Identity verified with DigiLocker",
                )}
              </p>
              {sandbox && (
                <p className="text-xs font-medium text-amber-700">
                  {t(
                    "onboarding.digilocker.sandboxNotice",
                    "Test mode — simulated DigiLocker data",
                  )}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-secondary-app hover:text-on-surface transition-colors"
          >
            {t("onboarding.digilocker.verifyAgain", "Verify again")}
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl bg-white/70 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-secondary-app">
                {row.label}
              </dt>
              <dd className="text-sm font-semibold break-all">
                {row.value || (
                  <span className="text-secondary-app font-medium">
                    {t(
                      "onboarding.digilocker.notInDigilocker",
                      "Not in DigiLocker",
                    )}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  const waiting = status === "starting" || status === "pending";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-kinetic/10 flex items-center justify-center">
          <Icon name="fingerprint" className="text-xl text-brand-kinetic" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {t(
              "onboarding.digilocker.title",
              "Verify the owner's identity with DigiLocker",
            )}
          </p>
          <p className="text-xs text-secondary-app mt-1 leading-relaxed">
            {t(
              "onboarding.digilocker.description",
              "Sign in to DigiLocker and allow access. We read the owner's Aadhaar (masked) and PAN directly from the government issuer — no uploads needed for them.",
            )}
          </p>
        </div>
      </div>

      {waiting ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <span className="flex items-center gap-2 text-xs font-medium text-blue-700">
            <Icon name="progress_activity" className="text-base animate-spin" />
            {t(
              "onboarding.digilocker.waiting",
              "Waiting for you to finish in the DigiLocker window…",
            )}
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            {t("onboarding.digilocker.cancel", "Cancel")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => start(ownerPhone)}
          className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-kinetic text-white text-sm font-semibold hover:bg-brand-kinetic/90 transition-all"
        >
          <Icon name="open_in_new" className="text-base" />
          {t("onboarding.digilocker.start", "Verify with DigiLocker")}
        </button>
      )}

      {status === "failed" && error && (
        <p className="mt-3 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
