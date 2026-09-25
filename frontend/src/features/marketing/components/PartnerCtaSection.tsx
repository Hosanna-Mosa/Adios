import { useTranslation } from "react-i18next";
import { FadeIn } from "../../../components/motion/FadeIn";

type Props = { onGetStarted: () => void };

export function PartnerCtaSection({ onGetStarted }: Props) {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gradient-to-br from-brand-kinetic via-gradient-flame to-brand-kinetic">
      <FadeIn
        inView
        className="container max-w-[700px] mx-auto px-6 text-center"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          {t("partnerCta.title")}
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          {t("partnerCta.subtitle")}
        </p>
        <button
          type="button"
          onClick={onGetStarted}
          className="inline-block bg-white text-brand-kinetic px-8 py-3.5 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          {t("partnerCta.getStartedNow")}
        </button>
      </FadeIn>
    </section>
  );
}
