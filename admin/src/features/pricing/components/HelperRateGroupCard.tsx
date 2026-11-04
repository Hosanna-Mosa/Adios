import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { HELPER_RATE_LIMITS, type HelperRateKey, type HelperRatesForm } from "../helperPricingTypes";

interface HelperRateGroupCardProps {
  groupId: string;
  fields: HelperRateKey[];
  form: HelperRatesForm;
  errors: Partial<Record<HelperRateKey, string>>;
  onChange: (key: HelperRateKey, value: string) => void;
  disabled?: boolean;
}

/** One titled group of helper-rate inputs (Fare, Offer limits, Booking, Search). */
export function HelperRateGroupCard({ groupId, fields, form, errors, onChange, disabled }: HelperRateGroupCardProps) {
  const { t } = useTranslation();
  return (
    <StaggerItem className="section-card p-6 flex flex-col gap-5">
      <div>
        <h4 className="font-bold text-foreground">{t(`helperPricing.groups.${groupId}.title`)}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{t(`helperPricing.groups.${groupId}.desc`)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((key) => {
          const { min, max, step } = HELPER_RATE_LIMITS[key];
          const error = errors[key];
          const inputId = `helper-rate-${key}`;
          return (
            <div key={key}>
              <label htmlFor={inputId} className="text-xs font-semibold text-muted-foreground block mb-1">
                {t(`helperPricing.fields.${key}`)}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id={inputId}
                  type="number"
                  inputMode="decimal"
                  min={min}
                  max={max}
                  step={step}
                  value={form[key]}
                  disabled={disabled}
                  aria-invalid={!!error}
                  aria-describedby={`${inputId}-hint`}
                  className={error ? "border-destructive focus-visible:ring-destructive" : undefined}
                  onChange={(e) => onChange(key, e.target.value)}
                />
                <span className="text-xs font-semibold text-muted-foreground shrink-0 min-w-[3rem]">
                  {t(`helperPricing.units.${key}`)}
                </span>
              </div>
              <span id={`${inputId}-hint`} className={`text-[10px] mt-1 block ${error ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                {error || t(`helperPricing.hints.${key}`)}
              </span>
            </div>
          );
        })}
      </div>
    </StaggerItem>
  );
}
