import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function OnboardingStepper({ form }: Props) {
  const { t } = useTranslation();
  const { onboardingSteps, step, setStep, copy } = form;
  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white border-r border-gray-200 fixed top-0 left-0 h-screen z-40">
      <div className="p-6 border-b border-gray-100">
        <Link
          to="/partner"
          className="font-display text-xl font-extrabold text-brand-kinetic tracking-tighter"
        >
          ADIOS<span className="text-on-surface"> Partner</span>
        </Link>
        <p className="text-xs text-secondary-app mt-2 font-medium">
          {copy.sidebarTitle}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {onboardingSteps.map((s, i) => {
          const isActive = s.num === step;
          const isCompleted = s.num < step;
          return (
            <button
              key={s.num}
              onClick={() => {
                if (isCompleted) setStep(s.num);
              }}
              disabled={!isCompleted && !isActive}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-kinetic/10 text-brand-kinetic"
                  : isCompleted
                    ? "text-green-700 hover:bg-green-50"
                    : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-brand-kinetic text-white"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Icon name="check" className="text-sm" />
                ) : (
                  s.num
                )}
              </span>
              <div className="text-left">
                <p className="font-semibold leading-tight">{s.label}</p>
                <p
                  className={`text-[11px] mt-0.5 ${isActive ? "text-brand-kinetic/60" : "text-gray-400"}`}
                >
                  {isCompleted
                    ? t("onboarding.completed")
                    : isActive
                      ? t("onboarding.inProgress")
                      : t("onboarding.pending")}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Progress indicator at bottom of sidebar */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-secondary-app">
            {t("onboarding.overallProgress")}
          </span>
          <span className="text-xs font-bold text-brand-kinetic">
            {Math.round((step / 4) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-kinetic rounded-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
