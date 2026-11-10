import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import { LazyImage } from "@/components/shared/LazyImage";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

type Service = {
  key: "food" | "meat" | "rides" | "parcel";
  icon: string;
  image: string;
  /** Grid slot on large screens: left column (food, meat) / right (rides, parcel). */
  slot: string;
};

/*
 * Large-screen layout (3 columns × 2 rows):
 *
 *   Food   |        | Ride
 *   -------| Helper |-------
 *   Meat   |        | Parcel
 */
const SIDE_SERVICES: Service[] = [
  {
    key: "food",
    icon: "restaurant",
    image: img("1589302168068-964664d93dc0"),
    slot: "lg:col-start-1 lg:row-start-1",
  },
  {
    key: "meat",
    icon: "set_meal",
    image: img("1607623814075-e51df1bdc82f"),
    slot: "lg:col-start-1 lg:row-start-2",
  },
  {
    key: "rides",
    icon: "two_wheeler",
    image: img("1558981806-ec527fa84c39"),
    slot: "lg:col-start-3 lg:row-start-1",
  },
  {
    key: "parcel",
    icon: "package_2",
    image: img("1526367790999-0150786686a2"),
    slot: "lg:col-start-3 lg:row-start-2",
  },
];

/** Food, meat, rides and parcels around a highlighted Helper card. */
export function ServiceCards() {
  const { t } = useTranslation();
  return (
    <section
      id="services"
      className="scroll-mt-20 bg-background py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-on-surface md:text-4xl">
            {t("home.services.title")}
          </h2>
          <p className="mt-3 text-secondary-app md:text-lg">
            {t("home.services.subtitle")}
          </p>
        </div>

        <StaggerList
          inView
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1.15fr_1fr] lg:grid-rows-2"
        >
          {/* Highlighted Helper card — first on phones, centre column on desktop */}
          <StaggerItem className="sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <a
              id="service-helper"
              href="#helper"
              className="group relative flex h-full min-h-[420px] scroll-mt-24 flex-col justify-end overflow-hidden rounded-3xl bg-brand-dark text-white shadow-xl shadow-primary/25 ring-4 ring-primary/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 lg:min-h-0"
            >
              <img
                src="/images/helper-at-work.jpg"
                alt={t("home.services.helper.alt")}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark from-10% via-brand-dark/70 via-45% to-transparent to-80%" />

              <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-md">
                <Icon name="handyman" className="text-base" />
                {t("home.helper.eyebrow")}
              </span>

              <div className="relative p-6 md:p-7">
                <h3 className="font-display text-2xl font-bold md:text-3xl">
                  {t("home.services.helper.title")}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85 md:text-base">
                  {t("home.services.helper.desc")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(
                    ["shifting", "cleaning", "queueErrands", "loading"] as const
                  ).map((task) => (
                    <span
                      key={task}
                      className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur"
                    >
                      {t(`home.helper.tasks.${task}`)}
                    </span>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-action px-5 py-3 text-sm font-semibold text-white shadow-lg transition group-hover:gap-3 group-hover:bg-white group-hover:text-primary">
                  {t("home.services.helper.cta")}
                  <Icon name="arrow_forward" className="text-base" />
                </span>
              </div>
            </a>
          </StaggerItem>

          {SIDE_SERVICES.map((s) => (
            <StaggerItem key={s.key} className={s.slot}>
              <a
                id={`service-${s.key}`}
                href="#download"
                className="group flex h-full scroll-mt-24 overflow-hidden rounded-2xl border border-surface-container bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="relative w-[42%] shrink-0 overflow-hidden">
                  <LazyImage
                    src={s.image}
                    alt={t(`home.services.${s.key}.alt`)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    wrapperClassName="absolute inset-0"
                  />
                  <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-md">
                    <Icon name={s.icon} className="text-lg" />
                  </span>
                </div>
                <div className="flex min-h-[215px] flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold text-on-surface">
                    {t(`home.services.${s.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-secondary-app">
                    {t(`home.services.${s.key}.desc`)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-primary">
                    {t(`home.services.${s.key}.cta`)}
                    <Icon
                      name="arrow_forward"
                      className="text-base transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
