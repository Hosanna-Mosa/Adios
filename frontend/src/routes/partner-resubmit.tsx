import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "../components/shared/Icon";
import { apiFetch } from "../lib/api-client";
import { getPartnerCopy } from "../features/onboarding/constants";
import { useKycDocuments } from "../features/onboarding/hooks/useKycDocuments";
import { usePartnerTheme } from "../features/onboarding/hooks/usePartnerTheme";
import { StepKycDocuments } from "../features/onboarding/components/StepKycDocuments";
import { ApplicationStatusCard } from "../features/onboarding/components/ApplicationStatusCard";
import type {
  KycSection,
  PartnerApplication,
} from "../features/onboarding/types";

interface Credentials {
  email?: string;
  phone?: string;
  password: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm";

/**
 * Where a restaurant / meat-center applicant uploads the documents an admin
 * asked for again. Signs in with the onboarding email/phone + portal password
 * (the vendor portal itself stays closed until the application is approved).
 */
export default function PartnerResubmit() {
  usePartnerTheme();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [application, setApplication] = useState<PartnerApplication | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resubmitted, setResubmitted] = useState(false);

  const docs = useKycDocuments(application?.kyc?.panNumber);

  const requested = application?.verificationReview.requestedDocuments || [];
  const copy = getPartnerCopy()[application?.partnerType || "food"];
  const canSubmit =
    requested.length > 0 && requested.every(docs.isSectionComplete);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = identifier.trim();
    const creds: Credentials = value.includes("@")
      ? { email: value.toLowerCase(), password }
      : { phone: value.replace(/\D/g, ""), password };

    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ application: PartnerApplication }>(
        "/vendors/onboarding/application",
        {
          method: "POST",
          body: JSON.stringify(creds),
        },
      );
      setCredentials(creds);
      setApplication(res.application);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubmit = async () => {
    if (!credentials) return;
    setIsSubmitting(true);
    setError("");
    try {
      await apiFetch("/vendors/onboarding/resubmit", {
        method: "POST",
        body: JSON.stringify({
          ...credentials,
          documents: docs.getDocumentsPayload(),
        }),
      });
      setResubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentLabel = (section: KycSection) =>
    ({
      identity: t("resubmit.documents.identity", "Owner identity (DigiLocker)"),
      pan: t("resubmit.documents.pan", "PAN card"),
      gst: t("resubmit.documents.gst", "GST certificate"),
      fssai: t("resubmit.documents.fssai", "FSSAI licence"),
      bank: t("resubmit.documents.bank", "Bank account / cancelled cheque"),
    })[section];

  return (
    <div className="min-h-screen bg-onboarding-surface px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/partner"
          className="font-display text-lg font-extrabold text-brand-kinetic tracking-tighter"
        >
          ADIOS
        </Link>

        {resubmitted ? (
          <div className="mt-16 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
              <Icon name="check_circle" className="text-5xl text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">
              {t("resubmit.doneTitle", "Documents resubmitted")}
            </h1>
            <p className="text-secondary-app mb-8 leading-relaxed">
              {t(
                "resubmit.doneDescription",
                "Thanks! Our team will review your application again and email you once it's approved.",
              )}
            </p>
            <Link
              to="/"
              className="inline-block bg-brand-kinetic text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-kinetic/90 transition-all"
            >
              {t("onboarding.backToHome")}
            </Link>
          </div>
        ) : !application ? (
          <form
            onSubmit={handleSignIn}
            className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-5"
          >
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">
                {t("resubmit.title", "Resubmit documents")}
              </h1>
              <p className="text-secondary-app text-sm">
                {t(
                  "resubmit.signInDescription",
                  "Sign in with the email or phone number and password you used during partner onboarding.",
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("resubmit.emailOrPhone", "Email or phone number")}
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("onboarding.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            {error && (
              <p className="text-xs font-medium text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading || !identifier.trim() || !password}
              className="w-full px-5 py-3 rounded-xl bg-brand-kinetic text-white text-sm font-semibold hover:bg-brand-kinetic/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? t("resubmit.signingIn", "Signing in…")
                : t("resubmit.continue", "Continue")}
            </button>
          </form>
        ) : application.onboardingStatus !== "resubmission_required" ? (
          <ApplicationStatusCard application={application} />
        ) : (
          <div className="mt-10">
            <div className="mb-8">
              <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
                {t("resubmit.formTitle", {
                  name: application.name,
                  defaultValue: "Update documents for {{name}}",
                })}
              </h1>
              <p className="text-secondary-app text-sm">
                {t(
                  "resubmit.formDescription",
                  "Our team asked for the following documents again:",
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {requested.map((section) => (
                  <span
                    key={section}
                    className="rounded-full bg-brand-kinetic/10 px-3 py-1 text-xs font-semibold text-brand-kinetic"
                  >
                    {documentLabel(section)}
                  </span>
                ))}
              </div>
              {application.verificationReview.note && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    {t("resubmit.noteFromTeam", "Note from our team")}
                  </p>
                  <p className="text-sm text-amber-900 mt-1 whitespace-pre-line">
                    {application.verificationReview.note}
                  </p>
                </div>
              )}
            </div>

            <StepKycDocuments
              docs={docs}
              isMeatPartner={application.partnerType === "meat"}
              copy={copy}
              ownerPhone={credentials?.phone}
              sections={requested}
              showHeading={false}
            />

            {error && (
              <p className="mb-4 text-sm font-medium text-red-600">{error}</p>
            )}
            <button
              type="button"
              onClick={handleResubmit}
              disabled={!canSubmit || isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-kinetic text-white font-semibold hover:bg-brand-kinetic/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t("resubmit.submitting", "Submitting…")
                : t("resubmit.submit", "Resubmit for review")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
