import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { dayLabel } from "../constants";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function StepContractReview({ form }: Props) {
  const { t } = useTranslation();
  const {
    isMeatPartner,
    copy,
    acceptedTos,
    setAcceptedTos,
    signature,
    setSignature,
    restaurantName,
    cuisines,
    area,
    city,
    ownerName,
    ownerEmail,
    ownerPhone,
    selectedDays,
    dayTimeSlots,
    gstExempt,
    digilocker,
  } = form;
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
          {t("onboarding.partnerContractAndFinalReview")}
        </h1>
        <p className="text-secondary-app text-sm">
          {t("onboarding.reviewAgreementAndSign")}
        </p>
      </div>

      {/* ── Section 4.1: Commission & Commercial T&Cs ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon
              name="receipt_long"
              className="text-base text-brand-kinetic"
            />
          </div>
          <h2 className="font-display text-lg font-bold">
            {t("onboarding.commissionAndCommercialTerms")}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="space-y-4">
            {[
              {
                label: t("onboarding.deliveryCommission"),
                value: t("onboarding.deliveryCommissionValue"),
              },
              {
                label: t("onboarding.platformFee"),
                value: t("onboarding.platformFeeValue"),
              },
              {
                label: t("onboarding.paymentCycle"),
                value: t("onboarding.paymentCycleValue"),
              },
              {
                label: t("onboarding.cancellationPolicy"),
                value: t("onboarding.cancellationPolicyValue"),
              },
              {
                label: t("onboarding.promotionalContribution"),
                value: t("onboarding.promotionalContributionValue"),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-kinetic mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {item.label}
                  </p>
                  <p className="text-xs text-secondary-app mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4.2: Digital Sign-off ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="signature" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">
            {t("onboarding.digitalSignOff")}
          </h2>
        </div>

        <div className="space-y-5">
          {/* Terms of Service */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold mb-3">
              {t("onboarding.termsOfService")}
            </label>
            <div className="h-48 overflow-y-auto bg-gray-50 rounded-xl p-4 text-xs text-secondary-app leading-relaxed border border-gray-100">
              <p className="font-semibold text-on-surface mb-2">
                {t("onboarding.contractTitle")}
              </p>
              <p className="mb-2">{t("onboarding.contractIntro")}</p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause1Title")}
                </strong>{" "}
                {t("onboarding.contractClause1Body", {
                  value: isMeatPartner
                    ? t("onboarding.meatCenterLower")
                    : t("onboarding.restaurantLower"),
                  service: copy.contractServiceText,
                  defaultValue:
                    "The Platform agrees to list the Partner's {{value}} and facilitate {{service}} to end customers through the Adios platform.",
                })}
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause2Title")}
                </strong>{" "}
                {t("onboarding.contractClause2Body")}
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause3Title")}
                </strong>{" "}
                {t("onboarding.contractClause3Body")}
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause4Title", {
                    value: isMeatPartner
                      ? t("onboarding.products")
                      : t("onboarding.menu"),
                    defaultValue: "4. {{value}} & Pricing:",
                  })}
                </strong>{" "}
                {t("onboarding.contractClause4Body")}
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause5Title")}
                </strong>{" "}
                {t("onboarding.contractClause5Body")}
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause6Title")}
                </strong>{" "}
                {t("onboarding.contractClause6Body")}
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause7Title")}
                </strong>{" "}
                {t("onboarding.contractClause7Body")}
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  {t("onboarding.contractClause8Title")}
                </strong>{" "}
                {t("onboarding.contractClause8Body")}
              </p>
              <p className="mt-3 text-on-surface">
                {t("onboarding.contractAcknowledgement")}
              </p>
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTos}
                onChange={() => setAcceptedTos(!acceptedTos)}
                className="mt-0.5 accent-brand-kinetic w-5 h-5"
              />
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {t("onboarding.acceptContractTerms")}{" "}
                  <span className="text-brand-kinetic">*</span>
                </p>
                <p className="text-xs text-secondary-app mt-1">
                  {t("onboarding.acceptContractTermsDesc")}
                </p>
              </div>
            </label>
          </div>

          {/* E-Signature */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold mb-2">
              {t("onboarding.digitalSignature")}{" "}
              <span className="text-brand-kinetic">*</span>
            </label>
            <p className="text-xs text-secondary-app mb-3">
              {t("onboarding.digitalSignatureDesc")}
            </p>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder={t("onboarding.typeFullLegalName")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm font-semibold"
            />
            {signature && (
              <div className="mt-4 p-4 rounded-xl bg-brand-kinetic/5 border border-brand-kinetic/10 text-center">
                <p className="text-xs text-secondary-app mb-1">
                  {t("onboarding.signedDigitallyBy")}
                </p>
                <p
                  className="font-semibold text-on-surface text-lg font-['Brush_Script_MT',cursive]"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  {signature}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Review Summary */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
            <Icon name="summarize" className="text-base text-brand-kinetic" />
          </div>
          <h2 className="font-display text-lg font-bold">
            {t("onboarding.applicationSummary")}
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              label: copy.summaryLabel,
              value: restaurantName,
              detail: `${cuisines.join(", ")} · ${area}, ${city}`,
            },
            {
              label: t("onboarding.owner"),
              value: ownerName,
              detail: `${ownerEmail} · ${ownerPhone}`,
            },
            {
              label: t("onboarding.hours"),
              value: t("onboarding.daysPerWeek", {
                count: selectedDays.length,
                defaultValue: "{{count}} days/week",
              }),
              detail: selectedDays
                .map(
                  (day) =>
                    `${dayLabel(day)}: ${(dayTimeSlots[day] || []).map((s) => `${s.open} - ${s.close}`).join(", ")}`,
                )
                .join(" | "),
            },
            {
              label: t("onboarding.documents"),
              value: t("onboarding.allUploaded"),
              detail: `${t("onboarding.digilocker.reviewIdentity", {
                name: digilocker.kyc?.holderName || "",
                defaultValue: "Identity verified with DigiLocker ({{name}})",
              })} · ${t("onboarding.pan")} · ${gstExempt ? t("onboarding.gstExempt") : t("onboarding.gst")} · ${t("onboarding.fssai")} · ${t("onboarding.bank")}`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-secondary-app font-semibold uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                <p className="text-xs text-secondary-app/70 mt-0.5">
                  {item.detail}
                </p>
              </div>
              <span className="text-green-600">
                <Icon name="check_circle" className="text-xl" />
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
