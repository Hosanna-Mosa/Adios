import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../components/shared/Icon";
import { useOnboardingForm } from "../features/onboarding/hooks/useOnboardingForm";
import { OnboardingStepper } from "../features/onboarding/components/OnboardingStepper";
import { StepBusinessInfo } from "../features/onboarding/components/StepBusinessInfo";
import { StepTimings } from "../features/onboarding/components/StepTimings";
import { StepMenuUpload } from "../features/onboarding/components/StepMenuUpload";
import { StepKycDocuments } from "../features/onboarding/components/StepKycDocuments";
import { StepContractReview } from "../features/onboarding/components/StepContractReview";
import { SaveDraftModal } from "../features/onboarding/components/SaveDraftModal";

export default function PartnerOnboarding() {
  const form = useOnboardingForm();
  const {
    step,
    submitted,
    copy,
    isMeatPartner,
    onboardingSteps,
    setShowSaveModal,
    isSubmitting,
    acceptedTos,
    signature,
    handleBack,
    handleNext,
    handleFinalSubmit,
    canProceedStep1,
    canProceedStep2,
    canProceedStep3,
  } = form;

  // ── Submitted State ─────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-onboarding-surface flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
            <Icon name="check_circle" className="text-5xl text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">
            Application Submitted!
          </h1>
          <p className="text-secondary-app mb-8 leading-relaxed">
            Thank you for partnering with Hybrid. Our team will review your
            application and reach out within 24 hours to help you go live. After
            approval, sign in to the vendor portal with your owner email or
            phone number and the password you set.
          </p>
          <Link
            to="/"
            className="inline-block bg-brand-kinetic text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-kinetic/90 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-onboarding-surface flex">
      {/* ─── Left Sidebar: Progress Tracker ─── */}
      <OnboardingStepper form={form} />

      {/* ─── Right Content Area ─── */}
      <div className="flex-1 lg:ml-[280px]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:border-none">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <Link
                to="/partner"
                className="lg:hidden font-display text-lg font-extrabold text-brand-kinetic tracking-tighter"
              >
                HYBRID
              </Link>
              {/* Mobile step indicator */}
              <div className="lg:hidden flex items-center gap-2 text-sm">
                <span className="font-semibold text-on-surface">
                  Step {step}/4
                </span>
                <span className="text-secondary-app">
                  — {onboardingSteps[step - 1].label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-secondary-app hover:text-on-surface hover:border-gray-300 transition-all"
              >
                <Icon name="save" className="text-lg" />
                <span className="hidden sm:inline">Save Draft</span>
              </button>
              <a
                href="#"
                className="text-sm text-secondary-app hover:text-on-surface transition-colors flex items-center gap-1"
              >
                <Icon name="help_outline" className="text-lg" />
                <span className="hidden sm:inline">Help</span>
              </a>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="lg:hidden px-4 pb-3">
            <div className="flex items-center justify-between gap-1">
              {onboardingSteps.map((s) => {
                const isActive = s.num === step;
                const isCompleted = s.num < step;
                return (
                  <div
                    key={s.num}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                          ? "bg-brand-kinetic"
                          : "bg-gray-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="px-4 lg:px-8 py-6 lg:py-10 max-w-[900px] mx-auto pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* ═══════════════ STEP 1: Restaurant Information ═══════════════ */}
              {step === 1 && <StepBusinessInfo form={form} />}

              {/* ═══════════════ STEP 2: Menu & Operational Details ═══════════════ */}
              {step === 2 && (
                <div>
                  <div className="mb-8">
                    <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
                      {isMeatPartner
                        ? "Operational Details"
                        : "Menu & Operational Details"}
                    </h1>
                    <p className="text-secondary-app text-sm">
                      {copy.menuHelp}
                    </p>
                  </div>

                  {/* ── Section 2.1: Operational Timings ── */}
                  <StepTimings form={form} />

                  {/* ── Section 2.2: Menu Setup ── */}
                  {!isMeatPartner && <StepMenuUpload form={form} />}
                </div>
              )}

              {/* ═══════════════ STEP 3: Documents & Legal Verification ═══════════════ */}
              {step === 3 && <StepKycDocuments form={form} />}

              {/* ═══════════════ STEP 4: Contract & Review ═══════════════ */}
              {step === 4 && <StepContractReview form={form} />}
            </motion.div>
          </AnimatePresence>

          {/* ─── Navigation Footer ─── */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] z-30 bg-white border-t border-gray-200 px-4 lg:px-8 py-4">
            <div className="max-w-[900px] mx-auto flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-secondary-app hover:text-on-surface hover:border-gray-300 transition-all"
                >
                  <Icon name="arrow_back" className="text-lg" />
                  Back
                </button>
              ) : (
                <Link
                  to="/partner"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-secondary-app hover:text-on-surface hover:border-gray-300 transition-all"
                >
                  <Icon name="close" className="text-lg" />
                  Cancel
                </Link>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-secondary-app hover:text-on-surface hover:border-gray-300 transition-all"
                >
                  <Icon name="save" className="text-lg" />
                  Save Draft
                </button>

                {step < 4 ? (
                  <button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !canProceedStep1()) ||
                      (step === 2 && !canProceedStep2()) ||
                      (step === 3 && !canProceedStep3())
                    }
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-kinetic text-white text-sm font-semibold hover:bg-brand-kinetic/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <Icon name="arrow_forward" className="text-lg" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={
                      !acceptedTos || signature.length < 2 || isSubmitting
                    }
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Icon
                      name={isSubmitting ? "pending" : "how_to_reg"}
                      className="text-lg"
                    />
                    {isSubmitting ? "Submitting..." : "Submit & Sign"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Save as Draft Modal ─── */}
      <SaveDraftModal form={form} />
    </div>
  );
}
