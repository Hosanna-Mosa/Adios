import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

const STEPS = [
  { key: "choose", icon: "touch_app" },
  { key: "track", icon: "location_on" },
  { key: "enjoy", icon: "sentiment_very_satisfied" },
] as const;

/** Three-step customer explainer: choose → track live → enjoy. */
export function HowAdiosWorks() {
  const { t } = useTranslation();
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 bg-background py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-on-surface md:text-4xl">
            {t("home.how.title")}
          </h2>
          <p className="mt-3 text-secondary-app md:text-lg">
            {t("home.how.subtitle")}
          </p>
        </div>
        <StaggerList inView className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <StaggerItem
              key={s.key}
              className="relative rounded-2xl border border-surface-container bg-white p-7"
            >
              <span className="absolute right-6 top-5 font-display text-5xl font-extrabold text-soft">
                {i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft text-primary">
                <Icon name={s.icon} className="text-2xl" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-on-surface">
                {t(`home.how.${s.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-app">
                {t(`home.how.${s.key}.desc`)}
              </p>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
