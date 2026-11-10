import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

/**
 * Minimal bar: logo, language switcher and the download CTA. Transparent over
 * the hero video, turning solid white once the page scrolls.
 */
export function Header() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only the home page opens on the dark video hero; elsewhere stay solid.
  const solid = scrolled || pathname !== "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-surface-container bg-white/95 py-3 shadow-[0_8px_24px_rgba(23,23,23,0.04)] backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-black/40 to-transparent py-4"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className={`font-display text-[26px] font-black tracking-tight transition-colors ${
            solid ? "text-primary" : "text-white"
          }`}
        >
          Adios
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <LanguageSwitcher variant={solid ? "default" : "light"} />
          <a
            href="#download"
            className="inline-flex rounded-full bg-brand-action px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-action/90 sm:px-5 sm:py-2.5"
          >
            {t("header.downloadApp")}
          </a>
        </div>
      </nav>
    </header>
  );
}
