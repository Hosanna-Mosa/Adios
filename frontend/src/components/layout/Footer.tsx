import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { StoreBadges } from "@/features/marketing/components/StoreBadges";

type FooterLink = { label: string; href: string; route?: boolean };

/** White, multi-column footer (Zomato-style layout, Adios palette). */
export function Footer() {
  const { t } = useTranslation();

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t("footer.aboutAdios"),
      links: [
        { label: t("footer.whoWeAre"), href: "/#services", route: true },
        { label: t("header.faq"), href: "/#faq", route: true },
        { label: t("footer.howItWorks"), href: "/#how-it-works", route: true },
        { label: t("footer.contactSupport"), href: "#support" },
      ],
    },
    {
      title: t("footer.services"),
      links: [
        {
          label: t("home.hero.quick.food"),
          href: "/#service-food",
          route: true,
        },
        {
          label: t("home.hero.quick.meat"),
          href: "/#service-meat",
          route: true,
        },
        {
          label: t("home.hero.quick.rides"),
          href: "/#service-rides",
          route: true,
        },
        {
          label: t("home.hero.quick.parcel"),
          href: "/#service-parcel",
          route: true,
        },
        {
          label: t("home.hero.quick.helper"),
          href: "/#helper",
          route: true,
        },
      ],
    },
    {
      title: t("footer.forPartners"),
      links: [
        { label: t("footer.partnerWithUs"), href: "/#partner", route: true },
        { label: t("footer.rideWithUs"), href: "/#earn", route: true },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        {
          label: t("footer.termsAndConditions"),
          href: "/legal/terms",
          route: true,
        },
        {
          label: t("footer.cookiePolicy"),
          href: "/legal/cookies",
          route: true,
        },
        {
          label: t("footer.privacyPolicy"),
          href: "/legal/privacy",
          route: true,
        },
      ],
    },
  ];

  const linkCls =
    "text-sm text-secondary-app transition-colors hover:text-primary";

  return (
    <footer className="border-t border-surface-container bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-surface-container pb-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="font-display text-3xl font-black tracking-tight text-primary"
          >
            Adios
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-2 gap-10 py-10 md:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.route && !l.href.includes("#") ? (
                      <Link to={l.href} className={linkCls}>
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className={linkCls}>
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">
              {t("footer.socialLinks")}
            </h4>
            <div className="mb-5 flex gap-2">
              {["public", "alternate_email", "photo_camera"].map((icon) => (
                <a
                  key={icon}
                  href="#social"
                  aria-label={icon}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-on-surface text-white transition hover:bg-primary"
                >
                  <Icon name={icon} className="text-base" />
                </a>
              ))}
            </div>
            <StoreBadges className="flex-col !gap-2" />
          </div>
        </div>

        <p className="border-t border-surface-container pt-8 text-xs leading-relaxed text-secondary-app">
          {t("footer.legalNote")} {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
