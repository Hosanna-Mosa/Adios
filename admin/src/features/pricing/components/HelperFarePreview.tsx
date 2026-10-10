import { useTranslation } from "react-i18next";
import { Calculator } from "lucide-react";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { computeHelperFare, EXAMPLE_TRIP, type HelperRates } from "../helperPricingTypes";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

interface HelperFarePreviewProps {
  /** Parsed form values; null while any field is invalid. */
  rates: HelperRates | null;
}

/** Live "Example fare" for a fixed sample trip, recomputed from the unsaved form values. */
export function HelperFarePreview({ rates }: HelperFarePreviewProps) {
  const { t } = useTranslation();
  const fare = rates ? computeHelperFare(rates, EXAMPLE_TRIP) : null;

  const rows = fare
    ? [
        { label: t("helperPricing.preview.baseFare"), value: fare.baseFare },
        { label: t("helperPricing.preview.timeFare", { hours: fare.hours }), value: fare.timeFare },
        { label: t("helperPricing.preview.distanceFare", { km: Math.max(0, EXAMPLE_TRIP.distanceKm - (rates?.freeKm ?? 0)) }), value: fare.distanceFare },
        { label: t("helperPricing.preview.platformFee"), value: fare.platformFee },
        { label: t("helperPricing.preview.tax", { percent: rates?.taxPercent }), value: fare.tax },
      ]
    : [];

  return (
    <StaggerItem className="section-card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand-teal-soft flex items-center justify-center text-brand-teal">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-foreground">{t("helperPricing.preview.title")}</h4>
          <p className="text-xs text-muted-foreground">
            {t("helperPricing.preview.trip", { hours: EXAMPLE_TRIP.hours, km: EXAMPLE_TRIP.distanceKm, surge: EXAMPLE_TRIP.surge })}
          </p>
        </div>
      </div>

      {fare ? (
        <>
          <dl className="space-y-2 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium text-foreground tabular-nums">{rupees(row.value)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-border pt-2">
              <dt className="font-bold text-foreground">{t("helperPricing.preview.total")}</dt>
              <dd className="font-bold text-brand-teal tabular-nums text-base">{rupees(fare.total)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
            {t("helperPricing.preview.offerRange", { min: rupees(fare.minOffer), max: rupees(fare.maxOffer) })}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("helperPricing.preview.invalid")}</p>
      )}

      <p className="text-[10px] text-muted-foreground">{t("helperPricing.preview.formula")}</p>
    </StaggerItem>
  );
}
