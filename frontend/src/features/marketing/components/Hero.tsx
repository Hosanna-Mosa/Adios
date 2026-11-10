import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Icon } from "@/components/shared/Icon";
import { BackgroundVideo } from "@/components/shared/BackgroundVideo";

const HERO_SOURCES = [
  { src: "/videos/hero-desktop.webm", type: "video/webm" as const },
  { src: "/videos/hero-desktop.mp4", type: "video/mp4" as const },
];
const HERO_MOBILE_SOURCES = [
  { src: "/videos/hero-mobile.mp4", type: "video/mp4" as const },
];

/** Quick links in the white pill under the headline — each jumps to its card. */
const QUICK_LINKS = [
  { key: "food", icon: "restaurant", href: "#service-food" },
  { key: "meat", icon: "set_meal", href: "#service-meat" },
  { key: "rides", icon: "two_wheeler", href: "#service-rides" },
  { key: "parcel", icon: "package_2", href: "#service-parcel" },
  { key: "helper", icon: "handyman", href: "#helper" },
] as const;

export function Hero() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-brand-dark text-white"
    >
      <BackgroundVideo
        sources={HERO_SOURCES}
        mobileSources={HERO_MOBILE_SOURCES}
        poster="/videos/hero-poster.jpg"
        className="-z-10"
        overlayClassName="bg-gradient-to-b from-black/60 via-black/35 to-brand-dark/85"
      />

      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-28 text-center sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-6xl font-black tracking-tight sm:text-7xl md:text-8xl"
        >
          Adios
        </motion.p>

        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-4 max-w-3xl font-display text-2xl font-semibold leading-snug sm:text-3xl md:text-4xl"
        >
          {t("home.hero.headline")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg"
        >
          {t("home.hero.subtitle")}
        </motion.p>

        {/* Zomato-style white pill: service shortcuts + primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-10 flex max-w-4xl flex-col gap-2 rounded-2xl bg-white p-2 text-on-surface shadow-2xl shadow-black/30 md:flex-row md:items-center md:rounded-full"
        >
          <div className="grid flex-1 grid-cols-3 gap-1 md:flex md:gap-0">
            {QUICK_LINKS.map((link, i) => (
              <a
                key={link.key}
                href={link.href}
                className={`group flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-soft hover:text-primary md:rounded-full ${
                  i > 0 ? "md:border-l md:border-surface-container" : ""
                }`}
              >
                <Icon
                  name={link.icon}
                  className="text-xl text-primary transition-transform group-hover:scale-110"
                />
                {t(`home.hero.quick.${link.key}`)}
              </a>
            ))}
          </div>
          <a
            href="#download"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-action px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-action/90 active:scale-[0.98] md:rounded-full"
          >
            <Icon name="download" className="text-lg" />
            {t("home.hero.getApp")}
          </a>
        </motion.div>
      </div>

      <a
        href="#services"
        aria-label={t("home.hero.scrollDown")}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/70 transition hover:text-white md:block"
      >
        <Icon name="keyboard_arrow_down" className="animate-bounce text-3xl" />
      </a>
    </section>
  );
}
