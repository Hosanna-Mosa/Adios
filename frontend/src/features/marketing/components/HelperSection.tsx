import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import { LazyImage } from "@/components/shared/LazyImage";
import { FadeIn } from "@/components/motion/FadeIn";

const IMAGE = "/images/helper-loading.jpg";

/** Task types offered in the customer app's "Hire a helper" flow. */
const TASK_TYPES = [
  { key: "shifting", icon: "local_shipping" },
  { key: "cleaning", icon: "cleaning_services" },
  { key: "queueErrands", icon: "directions_walk" },
  { key: "loading", icon: "inventory_2" },
] as const;

const STEPS = [
  { key: "describe", icon: "edit_note" },
  { key: "offer", icon: "currency_rupee" },
  { key: "match", icon: "person_check" },
] as const;

/**
 * Helper service: hire someone nearby for shifting, cleaning, queues and
 * loading. Mirrors the app's flow — describe the task, set an offer, a
 * nearby helper accepts; start OTP and completion PIN keep it safe.
 */
export function HelperSection() {
  const { t } = useTranslation();
  return (
    <section id="helper" className="scroll-mt-16 bg-white py-16 md:py-24">
      <FadeIn
        inView
        className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16"
      >
        {/* Image with floating safety badges */}
        <div className="relative order-last lg:order-first">
          <div className="overflow-hidden rounded-3xl shadow-xl shadow-primary/10">
            <LazyImage
              src={IMAGE}
              alt={t("home.helper.imageAlt")}
              className="h-[320px] w-full object-cover md:h-[440px]"
              wrapperClassName="w-full"
            />
          </div>
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-lg sm:left-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft text-success">
              <Icon name="verified_user" className="text-xl" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-on-surface">
                {t("home.helper.badgeOtpTitle")}
              </p>
              <p className="text-xs text-secondary-app">
                {t("home.helper.badgeOtpDesc")}
              </p>
            </div>
          </div>
          <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-full bg-brand-action px-4 py-2 text-sm font-semibold text-white shadow-lg sm:right-6">
            <Icon name="handyman" className="text-lg" />
            {t("home.hero.quick.helper")}
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Icon name="handyman" className="text-sm" />
            {t("home.helper.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-on-surface md:text-4xl">
            {t("home.helper.title")}
          </h2>
          <p className="mt-3 text-secondary-app md:text-lg">
            {t("home.helper.subtitle")}
          </p>

          {/* What a helper can do */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TASK_TYPES.map((task) => (
              <div
                key={task.key}
                className="flex flex-col items-center gap-2 rounded-2xl border border-surface-container bg-background px-2 py-4 text-center"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Icon name={task.icon} className="text-xl" />
                </span>
                <span className="text-sm font-medium text-on-surface">
                  {t(`home.helper.tasks.${task.key}`)}
                </span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <ol className="mt-8 space-y-4">
            {STEPS.map((step, i) => (
              <li key={step.key} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-on-surface">
                    {t(`home.helper.steps.${step.key}.title`)}
                  </p>
                  <p className="text-sm text-secondary-app">
                    {t(`home.helper.steps.${step.key}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <a
            href="#download"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-action px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-action/90"
          >
            {t("home.helper.cta")}
            <Icon name="arrow_forward" className="text-base" />
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
