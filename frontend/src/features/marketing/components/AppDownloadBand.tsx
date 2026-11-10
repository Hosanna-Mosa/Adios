import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import { FadeIn } from "@/components/motion/FadeIn";
import { StoreBadges } from "./StoreBadges";

/** "Get the Adios app" band with a CSS phone mockup and store badges. */
export function AppDownloadBand() {
  const { t } = useTranslation();
  const perks = ["perk1", "perk2", "perk3"] as const;

  return (
    <section id="download" className="scroll-mt-16 bg-soft py-16 md:py-24">
      <FadeIn
        inView
        className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-6 md:grid-cols-2"
      >
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface md:text-4xl">
            {t("home.download.title")}
          </h2>
          <p className="mt-3 text-secondary-app md:text-lg">
            {t("home.download.subtitle")}
          </p>
          <ul className="mt-6 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-on-surface">
                <Icon
                  name="check_circle"
                  className="fill-icon mt-0.5 text-xl text-primary"
                />
                <span>{t(`home.download.${p}`)}</span>
              </li>
            ))}
          </ul>
          <StoreBadges className="mt-8" />
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[260px] rounded-[2.5rem] border-[10px] border-on-surface bg-on-surface shadow-2xl shadow-primary/25">
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-on-surface" />
            <div className="overflow-hidden rounded-[1.9rem] bg-background">
              <div className="bg-primary px-4 pb-5 pt-9 text-white">
                <p className="text-[11px] text-white/70">
                  {t("home.download.mock.deliverTo")}
                </p>
                <p className="flex items-center gap-1 text-sm font-semibold">
                  <Icon name="location_on" className="text-base" />
                  {t("home.download.mock.home")}
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-secondary-app">
                  <Icon name="search" className="text-base text-primary" />
                  {t("home.download.mock.search")}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1 p-3">
                {[
                  ["restaurant", "food"],
                  ["set_meal", "meat"],
                  ["two_wheeler", "rides"],
                  ["package_2", "parcel"],
                  ["handyman", "helper"],
                ].map(([icon, key]) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <Icon name={icon} className="text-lg" />
                    </span>
                    <span className="text-[10px] font-medium text-on-surface">
                      {t(`home.hero.quick.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 px-3 pb-5">
                <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-on-surface">
                      {t("home.download.mock.orderTitle")}
                    </p>
                    <p className="text-[10px] text-secondary-app">
                      {t("home.download.mock.orderMeta")}
                    </p>
                  </div>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">
                    {t("home.download.mock.delivered")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-on-surface">
                      {t("home.download.mock.rideTitle")}
                    </p>
                    <p className="text-[10px] text-secondary-app">
                      {t("home.download.mock.rideMeta")}
                    </p>
                  </div>
                  <span className="rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {t("home.download.mock.onTheWay")}
                  </span>
                </div>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="w-full rounded-xl bg-brand-action py-2.5 text-xs font-semibold text-white"
                >
                  {t("home.download.mock.reorder")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
