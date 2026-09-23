import { FadeIn } from "@/components/motion/FadeIn";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** The "Fluidity Insight" callout panel on Payments. */
export function FluidityInsightPanel() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <FadeIn delay={0.05} className="section-card p-6 bg-muted/50 flex flex-col items-center justify-center text-center">
      <Sparkles className="h-8 w-8 text-primary mb-3" />
      <h3 className="text-xl font-bold text-foreground">{t("orders.fluidityInsight")}</h3>
      <p className="text-sm text-muted-foreground mt-3 max-w-[320px] leading-relaxed">
        {t("orders.fluidityInsightDesc")}
      </p>
      <button
        onClick={() => navigate("/analytics")}
        className="mt-5 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
      >
        {t("orders.viewAnalytics")}
      </button>
    </FadeIn>
  );
}
