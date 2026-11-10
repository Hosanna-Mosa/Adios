import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { FadeIn } from "../../../components/motion/FadeIn";
import { BackgroundVideo } from "@/components/shared/BackgroundVideo";

type Props = { onGetStarted: () => void };

export function PartnerHero({ onGetStarted }: Props) {
  const { t } = useTranslation();
  return (
    <section
      id="partner"
      className="relative isolate flex min-h-[80svh] scroll-mt-16 items-center overflow-hidden bg-brand-dark py-24 lg:py-28"
    >
      <BackgroundVideo
        sources={[{ src: "/videos/partner-hero.mp4", type: "video/mp4" }]}
        poster="/videos/partner-poster.jpg"
        className="-z-10"
        overlayClassName="bg-gradient-to-br from-black/70 via-brand-dark/70 to-brand/60"
      />
      <FadeIn className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <Icon name="handshake" className="text-lg" />
            {t("partnerHero.eyebrow")}
          </div>
          <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("partnerHero.headline")} <span className="text-soft">Adios</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/80">
            {t("partnerHero.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-brand-action px-8 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-brand-action/90 active:scale-95"
            >
              {t("partnerHero.getStartedToday")}
            </button>
            <a
              href="#partner-steps"
              className="rounded-full border border-white/25 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              {t("partnerHero.seeHowItWorks")}
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
