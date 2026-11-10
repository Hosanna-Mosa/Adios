import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import { LazyImage } from "@/components/shared/LazyImage";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

/** Two side-by-side CTAs: list your restaurant / ride with Adios. */
export function EarnWithAdios() {
  const { t } = useTranslation();
  const cards = [
    {
      key: "partner",
      icon: "storefront",
      image: img("1504674900247-0877df9cc836"),
      to: "#partner",
      internal: false,
    },
    {
      key: "driver",
      icon: "sports_motorsports",
      image: img("1449965408869-eaa3f722e40d"),
      to: "#download",
      internal: false,
    },
  ] as const;

  return (
    <section id="earn" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-on-surface md:text-4xl">
            {t("home.earn.title")}
          </h2>
          <p className="mt-3 text-secondary-app md:text-lg">
            {t("home.earn.subtitle")}
          </p>
        </div>
        <StaggerList inView className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map((c) => {
            const body = (
              <>
                <LazyImage
                  src={c.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand/80 to-brand/30" />
                <div className="relative flex h-full flex-col justify-end p-7 text-white md:p-9">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <Icon name={c.icon} className="text-2xl" />
                  </span>
                  <h3 className="font-display text-2xl font-bold">
                    {t(`home.earn.${c.key}.title`)}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-white/80">
                    {t(`home.earn.${c.key}.desc`)}
                  </p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition group-hover:gap-3">
                    {t(`home.earn.${c.key}.cta`)}
                    <Icon name="arrow_forward" className="text-base" />
                  </span>
                </div>
              </>
            );
            const cls =
              "group relative block min-h-[300px] overflow-hidden rounded-2xl";
            return (
              <StaggerItem key={c.key}>
                {c.internal ? (
                  <Link to={c.to} className={cls}>
                    {body}
                  </Link>
                ) : (
                  <a href={c.to} className={cls}>
                    {body}
                  </a>
                )}
              </StaggerItem>
            );
          })}
        </StaggerList>
      </div>
    </section>
  );
}
