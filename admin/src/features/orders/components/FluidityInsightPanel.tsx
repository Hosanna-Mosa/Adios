import { FadeIn } from "@/components/motion/FadeIn";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

/** The "Fluidity Insight" callout panel on Payments. */
export function FluidityInsightPanel() {
  const navigate = useNavigate();

  return (
    <FadeIn delay={0.05} className="section-card p-6 bg-muted/50 flex flex-col items-center justify-center text-center">
      <Sparkles className="h-8 w-8 text-primary mb-3" />
      <h3 className="text-xl font-bold text-foreground">Fluidity Insight</h3>
      <p className="text-sm text-muted-foreground mt-3 max-w-[320px] leading-relaxed">
        Implementing automated driver routing in Zone A could reduce payout delays by 14% and increase total revenue margin.
      </p>
      <button
        onClick={() => navigate("/analytics")}
        className="mt-5 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
      >
        View Analytics
      </button>
    </FadeIn>
  );
}
