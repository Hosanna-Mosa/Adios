import { Icon } from "../../../components/shared/Icon";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function StepContractReview({ form }: Props) {
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
  } = form;
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
          Partner Contract &amp; Final Review
        </h1>
        <p className="text-secondary-app text-sm">
          Review the partner agreement and sign digitally.
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
            Commission &amp; Commercial Terms
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="space-y-4">
            {[
              {
                label: "Delivery Commission",
                value: "15% per order (negotiable for high-volume partners)",
              },
              {
                label: "Platform Fee",
                value: "₹3 per order (capped at ₹10/month)",
              },
              {
                label: "Payment Cycle",
                value: "Weekly settlements — every Monday for the prior week",
              },
              {
                label: "Cancellation Policy",
                value:
                  "Free cancellation up to 5 mins. Late cancellations charged 10% of order value.",
              },
              {
                label: "Promotional Contribution",
                value:
                  "Optional. Shared cost for discounts & free delivery campaigns.",
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
          <h2 className="font-display text-lg font-bold">Digital Sign-off</h2>
        </div>

        <div className="space-y-5">
          {/* Terms of Service */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold mb-3">
              Terms of Service
            </label>
            <div className="h-48 overflow-y-auto bg-gray-50 rounded-xl p-4 text-xs text-secondary-app leading-relaxed border border-gray-100">
              <p className="font-semibold text-on-surface mb-2">
                HYBRID PARTNER MERCHANT AGREEMENT
              </p>
              <p className="mb-2">
                This Partner Merchant Agreement ("Agreement") is entered into
                between the merchant ("Partner") and HYBRID Technologies Inc.
                ("Platform").
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">1. Services:</strong> The
                Platform agrees to list the Partner's{" "}
                {isMeatPartner ? "meat center" : "restaurant"} and facilitate{" "}
                {copy.contractServiceText} to end customers through the HYBRID
                platform.
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">2. Commission:</strong>{" "}
                Partner agrees to pay a commission on each order as per the
                agreed commission structure. Commission rates are subject to
                review and modification with 30 days' notice.
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">3. Payment Terms:</strong>{" "}
                All payments due to Partner will be settled on a weekly basis,
                net of commissions, fees, and applicable taxes. Partner is
                responsible for providing accurate bank account details.
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  4. {isMeatPartner ? "Products" : "Menu"} & Pricing:
                </strong>{" "}
                Partner retains the right to set prices. The Platform may
                suggest pricing optimization. Partner must maintain accurate
                listings and availability.
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  5. Quality Standards:
                </strong>{" "}
                Partner agrees to maintain quality, hygiene standards, and
                packaging requirements as specified by the Platform.
                Non-compliance may result in de-listing.
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">
                  6. Term & Termination:
                </strong>{" "}
                This agreement shall remain in effect until terminated by either
                party with 30 days' written notice. The Platform reserves the
                right to terminate immediately for breach of terms.
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">7. Data & Privacy:</strong>{" "}
                Partner agrees to the collection and use of customer order data
                for analytics and platform improvement purposes, in accordance
                with applicable data protection laws.
              </p>
              <p className="mb-2">
                <strong className="text-on-surface">8. Indemnification:</strong>{" "}
                Partner agrees to indemnify and hold the Platform harmless from
                any claims arising from the quality or safety of products,
                delivery delays, or any breach of applicable laws.
              </p>
              <p className="mt-3 text-on-surface">
                By accepting this agreement, you acknowledge that you have read,
                understood, and agreed to all the terms and conditions outlined
                above.
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
                  I accept the partner contract terms and conditions.{" "}
                  <span className="text-brand-kinetic">*</span>
                </p>
                <p className="text-xs text-secondary-app mt-1">
                  By accepting, you agree to all the terms outlined in the
                  partner merchant agreement above.
                </p>
              </div>
            </label>
          </div>

          {/* E-Signature */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold mb-2">
              Digital Signature <span className="text-brand-kinetic">*</span>
            </label>
            <p className="text-xs text-secondary-app mb-3">
              Type your full name below as your digital signature. This serves
              as your legal acceptance of the agreement.
            </p>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full legal name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm font-semibold"
            />
            {signature && (
              <div className="mt-4 p-4 rounded-xl bg-brand-kinetic/5 border border-brand-kinetic/10 text-center">
                <p className="text-xs text-secondary-app mb-1">
                  Signed digitally by:
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
            Application Summary
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
              label: "Owner",
              value: ownerName,
              detail: `${ownerEmail} · ${ownerPhone}`,
            },
            {
              label: "Hours",
              value: `${selectedDays.length} days/week`,
              detail: selectedDays
                .map(
                  (day) =>
                    `${day}: ${(dayTimeSlots[day] || []).map((s) => `${s.open} - ${s.close}`).join(", ")}`,
                )
                .join(" | "),
            },
            {
              label: "Documents",
              value: "All uploaded ✓",
              detail: `PAN · ${gstExempt ? "GST Exempt" : "GST"} · FSSAI · Bank`,
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
