import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "../components/shared/Icon";
import { apiFetch } from "../lib/api-client";
import { usePartnerTheme } from "../features/onboarding/hooks/usePartnerTheme";

type AccountType = "USER" | "DRIVER" | "PARTNER";

const APP_LABELS: Record<AccountType, [key: string, fallback: string]> = {
  USER: ["deleteAccount.customerApp", "Flavour (customer)"],
  DRIVER: ["deleteAccount.driverApp", "Flavour Driver"],
  PARTNER: ["deleteAccount.partnerApp", "Flavour Partner"],
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL as string | undefined;

/**
 * Account deletion outside the app — Google Play requires a web link for it.
 * Customers, drivers and restaurant / meat-centre partners sign in with the same
 * phone/email and password as their app; the backend (POST /auth/delete-account)
 * anonymises the account the same way as the in-app option: details removed,
 * orders and invoices kept for tax.
 */
export default function DeleteAccount() {
  usePartnerTheme();
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState<AccountType>("USER");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = identifier.trim();
    setIsDeleting(true);
    setError("");
    try {
      await apiFetch("/auth/delete-account", {
        method: "POST",
        body: JSON.stringify({
          phone: value.includes("@")
            ? value.toLowerCase()
            : value.replace(/\D/g, ""),
          password,
          role: accountType,
        }),
      });
      setDeleted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const points = [
    t(
      "deleteAccount.points.removed",
      "Your name, phone number, email, saved addresses and profile photo are removed.",
    ),
    t(
      "deleteAccount.points.driver",
      "For drivers, your Aadhaar, PAN, driving licence, bank details and document photos are deleted too.",
    ),
    t(
      "deleteAccount.points.partner",
      "For partners, your owner details, KYC, PAN, bank account, signature, documents and menu are deleted and your outlet stops appearing to customers. The outlet name, address, GSTIN and FSSAI number stay on past invoices.",
    ),
    t(
      "deleteAccount.points.records",
      "Past orders, trips, invoices and payouts are kept without your details, because we must keep them for tax and accounting.",
    ),
    t(
      "deleteAccount.points.final",
      "You are signed out everywhere. This can't be undone, but you can sign up again later.",
    ),
  ];

  return (
    <div className="min-h-screen bg-onboarding-surface px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl">
        <Link
          to="/"
          className="font-display text-lg font-extrabold text-brand-kinetic tracking-tighter"
        >
          ADIOS
        </Link>

        {deleted ? (
          <div className="mt-16 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
              <Icon name="check_circle" className="text-5xl text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">
              {t("deleteAccount.doneTitle", "Your account has been deleted")}
            </h1>
            <p className="text-secondary-app mb-8 leading-relaxed">
              {t(
                "deleteAccount.doneDescription",
                "Your details have been removed and you have been signed out of the app on every device.",
              )}
            </p>
            <Link
              to="/"
              className="inline-block bg-brand-kinetic text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-kinetic/90 transition-all"
            >
              {t("onboarding.backToHome")}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-5"
          >
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">
                {t("deleteAccount.title", "Delete your Flavour account")}
              </h1>
              <p className="text-secondary-app text-sm">
                {t(
                  "deleteAccount.description",
                  "For customers, drivers and partners of the Flavour apps. Sign in with the phone number or email and password you use in the app.",
                )}
              </p>
            </div>

            <ul className="space-y-2 text-sm text-secondary-app list-disc pl-5">
              {points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <fieldset>
              <legend className="block text-sm font-semibold mb-2">
                {t("deleteAccount.accountType", "Which app do you use?")}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["USER", "DRIVER", "PARTNER"] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm cursor-pointer ${
                      accountType === type
                        ? "border-brand-kinetic bg-brand-kinetic/5 font-semibold"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={type}
                      checked={accountType === type}
                      onChange={() => setAccountType(type)}
                    />
                    {t(...APP_LABELS[type])}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="delete-identifier"
                className="block text-sm font-semibold mb-2"
              >
                {t("resubmit.emailOrPhone", "Email or phone number")}
              </label>
              <input
                id="delete-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="delete-password"
                className="block text-sm font-semibold mb-2"
              >
                {t("onboarding.password")}
              </label>
              <input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>
                {t(
                  "deleteAccount.confirm",
                  "I understand my account will be deleted and this can't be undone.",
                )}
              </span>
            </label>

            {error && (
              <p className="text-xs font-medium text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={
                isDeleting || !identifier.trim() || !password || !confirmed
              }
              className="w-full px-5 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting
                ? t("deleteAccount.deleting", "Deleting…")
                : t("deleteAccount.submit", "Delete my account")}
            </button>

            {SUPPORT_EMAIL && (
              <p className="text-xs text-secondary-app">
                {t(
                  "deleteAccount.noPassword",
                  "Can't sign in with a password?",
                )}{" "}
                <a
                  className="font-semibold text-brand-kinetic"
                  href={`mailto:${SUPPORT_EMAIL}?subject=Account%20deletion%20request`}
                >
                  {t(
                    "deleteAccount.emailUs",
                    "Email us to delete your account",
                  )}
                </a>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
