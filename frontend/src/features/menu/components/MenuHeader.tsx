import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isPureVeg: boolean;
  rating: number;
  reviews: string;
}

type Props = { restaurant: Restaurant };

export function MenuHeader({ restaurant }: Props) {
  const { t } = useTranslation();
  // Nothing writes a rating for a digital-menu restaurant until it has real reviews, so an
  // unrated one is labelled "New" instead of showing a made-up score and review count.
  const rating = Number(restaurant.rating) || 0;
  const hasRating = rating > 0;
  return (
    <>
      {/* Mobile Top App Bar (Sticky) */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm px-4 py-3 flex items-center justify-between md:hidden"
      >
        <Link
          to="/"
          className="p-2 -ml-2 rounded-full hover:bg-soft text-primary transition-colors"
        >
          <Icon name="arrow_back" />
        </Link>
        <h1 className="font-bold text-primary truncate px-2">
          {restaurant.name}
        </h1>
        <LanguageSwitcher />
      </motion.div>

      {/* Restaurant header card — light, Zomato-style layout on the Adios palette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden border-b border-surface-container bg-white px-4 py-8 md:px-20 md:py-12"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-brand-action to-brand" />

        <div className="relative z-10 mx-auto max-w-[1280px]">
          <div className="mb-8 hidden items-center justify-between md:flex">
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-app transition-colors hover:text-primary"
            >
              <Icon
                name="arrow_back"
                className="text-lg transition-transform group-hover:-translate-x-1"
              />
              {t("menu.backToHome")}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-3 text-center md:space-y-4 md:text-left"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="flex items-center gap-1 rounded-full bg-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary md:text-xs">
                  <Icon name="restaurant" className="text-xs md:text-sm" />{" "}
                  {t("menu.restaurant")}
                </span>
                {restaurant.isPureVeg ? (
                  <span className="flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-success md:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-success md:h-2 md:w-2" />{" "}
                    {t("menu.pureVeg")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-surface-container bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-app md:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-success md:h-2 md:w-2" />
                    <span className="h-1.5 w-1.5 rounded-full bg-danger md:h-2 md:w-2" />{" "}
                    {t("menu.vegAndNonVeg")}
                  </span>
                )}
                {!hasRating && (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white md:text-xs">
                    <Icon name="star" className="text-xs md:text-sm" />{" "}
                    {t("menu.new")}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface md:text-5xl">
                {restaurant.name}
              </h1>

              <div className="flex flex-col items-center justify-center gap-x-6 gap-y-1.5 text-xs text-secondary-app md:flex-row md:flex-wrap md:justify-start md:text-sm">
                <div className="flex items-center gap-1">
                  <Icon
                    name="location_on"
                    className="text-sm text-primary md:text-base"
                  />
                  <span className="max-w-[250px] truncate md:max-w-[480px]">
                    {restaurant.address}
                  </span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center gap-1">
                    <Icon
                      name="call"
                      className="text-sm text-primary md:text-base"
                    />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {hasRating && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto flex shrink-0 items-center gap-4 rounded-2xl border border-surface-container bg-white p-3 shadow-sm md:mx-0"
              >
                <span className="flex items-center gap-1 rounded-lg bg-success px-2.5 py-1.5 text-lg font-bold text-white">
                  {rating}
                  <Icon name="star" className="fill-icon text-base" />
                </span>
                <div className="pr-2 text-left leading-tight">
                  <div className="text-base font-bold text-on-surface">
                    {restaurant.reviews || "0"}
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-widest text-secondary-app">
                    {t("menu.reviews")}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
