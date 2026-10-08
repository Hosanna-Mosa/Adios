import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StaggerList } from "@/components/motion/StaggerList";
import { Button } from "@/components/ui/button";
import { useHelperPricing } from "@/features/pricing/hooks/useHelperPricing";
import { HelperRateGroupCard } from "@/features/pricing/components/HelperRateGroupCard";
import { HelperFarePreview } from "@/features/pricing/components/HelperFarePreview";
import { HELPER_RATE_GROUPS } from "@/features/pricing/helperPricingTypes";

export default function HelperPricing() {
  const { t } = useTranslation();
  const { form, setField, errors, rates, isLoading, isError, isDirty, handleSave, handleReset, isSaving } = useHelperPricing();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{t("helperPricing.title")}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{t("helperPricing.description")}</p>
          </div>
          {!isLoading && !isError && (
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl" onClick={handleReset} disabled={!isDirty || isSaving}>
                {t("helperPricing.reset")}
              </Button>
              <Button className="rounded-xl" onClick={handleSave} disabled={!isDirty || !rates || isSaving}>
                {isSaving ? t("common.savingEllipsis") : t("helperPricing.save")}
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" /> {t("helperPricing.loading")}
          </div>
        ) : isError ? (
          <div className="section-card p-6 text-sm text-destructive">{t("helperPricing.loadFailed")}</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <StaggerList className="xl:col-span-2 flex flex-col gap-6">
              {HELPER_RATE_GROUPS.map((group) => (
                <HelperRateGroupCard
                  key={group.id}
                  groupId={group.id}
                  fields={group.fields}
                  form={form}
                  errors={errors}
                  onChange={setField}
                  disabled={isSaving}
                />
              ))}
            </StaggerList>
            <StaggerList className="xl:sticky xl:top-6">
              <HelperFarePreview rates={rates} />
            </StaggerList>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
