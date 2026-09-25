import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save } from "lucide-react";
import { useMeatPricing } from "@/features/catalog/hooks/useMeatPricing";
import { GlobalPriceList } from "@/features/catalog/components/GlobalPriceList";

export default function MeatPricing() {
  const { t } = useTranslation();
  const { prices, isLoading, handlePriceChange, handleSave, isSaving } = useMeatPricing();

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("catalog.globalMeatPricing")}</h1>
            <p className="text-muted-foreground">{t("catalog.setDailyPricesDesc")}</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("catalog.saveDailyPrices")}
          </Button>
        </div>

        <GlobalPriceList prices={prices} isLoading={isLoading} onPriceChange={handlePriceChange} />

        <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl">
          <p className="text-sm text-blue-600 font-medium">
            💡 <strong>{t("catalog.noteColon")}</strong> {t("catalog.globalPricingNoteDesc")}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
