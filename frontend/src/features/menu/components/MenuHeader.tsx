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
          className="p-2 -ml-2 rounded-full hover:bg-slate-100/50 text-primary transition-colors"
        >
          <Icon name="arrow_back" />
        </Link>
        <h1 className="font-bold text-primary truncate px-2">
          {restaurant.name}
        </h1>
        <LanguageSwitcher />
      </motion.div>

      {/* Premium Hero Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-b from-primary to-navy-deep text-white overflow-hidden py-10 md:py-16 px-6 md:px-20 md:border-b border-slate-100 md:shadow-md rounded-b-[2.5rem] md:rounded-none"
      >
        {/* Animated Background Blob */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-72 md:w-[400px] h-72 md:h-[400px] rounded-full bg-menu-glow/20 blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3"
        />

        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="hidden md:flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-semibold group"
            >
              <Icon
                name="arrow_back"
                className="text-lg group-hover:-translate-x-1 transition-transform"
              />
              {t("menu.backToHome")}
            </Link>
            <LanguageSwitcher variant="light" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-3 md:space-y-4 text-center md:text-left"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
                  <Icon name="restaurant" className="text-xs md:text-sm" />{" "}
                  {t("menu.restaurant")}
                </span>
                {restaurant.isPureVeg ? (
                  <span className="bg-green-500/20 text-green-300 text-[10px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-green-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-400 animate-pulse" />{" "}
                    {t("menu.pureVeg")}
                  </span>
                ) : (
                  <span className="bg-orange-500/20 text-orange-300 text-[10px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-orange-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-orange-400" />{" "}
                    {t("menu.vegAndNonVeg")}
                  </span>
                )}
                {!hasRating && (
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] md:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-400/30 flex items-center gap-1">
                    <Icon name="star" className="text-xs md:text-sm" />{" "}
                    {t("menu.new")}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                {restaurant.name}
              </h1>

              <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center md:justify-start gap-y-1.5 gap-x-6 text-xs md:text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <Icon
                    name="map_pin"
                    className="text-sm md:text-base text-white/60"
                  />
                  <span className="truncate max-w-[250px]">
                    {restaurant.address}
                  </span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center gap-1">
                    <Icon
                      name="call"
                      className="text-sm md:text-base text-white/60"
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
                className="flex items-center justify-center gap-6 bg-white/10 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl mx-auto md:mx-0 shrink-0"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    <Icon
                      name="star"
                      className="fill-current text-lg md:text-xl"
                    />
                    <span className="text-lg md:text-xl font-black">
                      {rating}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs text-white/60 font-medium uppercase tracking-widest">
                    {t("menu.rating")}
                  </span>
                </div>
                <div className="w-[1px] h-10 bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-lg md:text-xl font-black text-white">
                    {restaurant.reviews || "0"}
                  </div>
                  <span className="text-[10px] md:text-xs text-white/60 font-medium uppercase tracking-widest">
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
