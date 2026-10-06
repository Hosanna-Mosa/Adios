import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";

interface FooterProps {
  /** "marketing" = Home's full 4-column footer. "minimal" = Partner's compact footer. */
  variant: "marketing" | "minimal";
}

export function Footer({ variant }: FooterProps) {
  if (variant === "minimal") return <MinimalFooter />;
  return <MarketingFooter />;
}

function MarketingFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-on-surface text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-10 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 text-left">
            <h2 className="text-[28px] font-black text-white mb-6 tracking-tight font-display">
              Adios
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6 font-body">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              <a
                href="#social"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
              >
                <Icon name="public" className="text-base" />
              </a>
              <a
                href="#social"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all"
              >
                <Icon name="alternate_email" className="text-base" />
              </a>
            </div>
          </div>

          <div className="text-left">
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-white/40 font-display">
              {t("footer.solutions")}
            </h4>
            <ul className="space-y-3.5 text-sm text-neutral-300 font-body">
              <li>
                <a
                  className="hover:text-brand-kinetic transition-colors"
                  href="#food"
                >
                  {t("footer.executiveFood")}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-brand-kinetic transition-colors"
                  href="#rides"
                >
                  {t("footer.executiveMotion")}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-brand-kinetic transition-colors"
                  href="#corporate"
                >
                  {t("footer.corporateAccounts")}
                </a>
              </li>
              <li>
                <Link
                  className="hover:text-brand-kinetic transition-colors"
                  to="/partner"
                >
                  {t("footer.partnerWithUs")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-left">
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-white/40 font-display">
              {t("footer.support")}
            </h4>
            <ul className="space-y-3.5 text-sm text-neutral-300 font-body">
              <li>
                <a
                  className="hover:text-brand-kinetic transition-colors"
                  href="#help"
                >
                  {t("footer.helpCenter")}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-brand-kinetic transition-colors"
                  href="#safety"
                >
                  {t("footer.safetyProtocols")}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-brand-kinetic transition-colors"
                  href="#privacy"
                >
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a
                  className="hover:text-brand-kinetic transition-colors"
                  href="#terms"
                >
                  {t("footer.termsOfService")}
                </a>
              </li>
            </ul>
          </div>

          <div className="text-left">
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-white/40 font-display">
              {t("footer.download")}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="#download"
                className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded hover:bg-white/10 transition-all max-w-[170px]"
              >
                <Icon name="grid_view" className="text-lg" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] uppercase tracking-wider text-neutral-400">
                    {t("footer.downloadOnThe")}
                  </span>
                  <span className="text-[13px] font-bold mt-0.5">
                    {t("footer.appStore")}
                  </span>
                </div>
              </a>
              <a
                href="#download"
                className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded hover:bg-white/10 transition-all max-w-[170px]"
              >
                <Icon name="play_arrow" className="text-lg" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] uppercase tracking-wider text-neutral-400">
                    {t("footer.getItOn")}
                  </span>
                  <span className="text-[13px] font-bold mt-0.5">
                    {t("footer.googlePlay")}
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-xs font-body">
            {t("footer.copyright")}
          </p>
          <div className="flex gap-8 text-xs font-bold text-white/40 uppercase tracking-widest font-display">
            <a className="hover:text-white" href="#privacy">
              {t("footer.privacy")}
            </a>
            <a className="hover:text-white" href="#terms">
              {t("footer.terms")}
            </a>
            <a className="hover:text-white" href="#security">
              {t("footer.security")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function MinimalFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-on-surface text-white pt-16 pb-10">
      <div className="container max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <Link
            to="/"
            className="font-display text-2xl font-extrabold text-brand-kinetic tracking-tighter"
          >
            ADIOS
          </Link>
          <div className="flex gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.privacyPolicy")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.termsOfService")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.contactSupport")}
            </a>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs">
            {t("footer.minimalCopyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
