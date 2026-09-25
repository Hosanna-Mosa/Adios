import { FadeIn } from "@/components/motion/FadeIn";
import { useTranslation } from "react-i18next";
import { getRevenueBreakdown } from "../paymentsTypes";

/** The "Revenue Breakdown" progress-bar panel on Payments. */
export function RevenueBreakdownPanel() {
  const { t } = useTranslation();
  const revenueBreakdown = getRevenueBreakdown(t);
  return (
    <FadeIn className="section-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">{t("orders.revenueBreakdown")}</h3>
      <div className="space-y-5">
        {revenueBreakdown.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground">{r.label}</span>
              <span className="text-sm font-semibold text-foreground">{r.pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: r.width }} />
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
