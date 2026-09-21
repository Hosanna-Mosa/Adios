import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save } from "lucide-react";
import { useMeatPricing } from "@/features/catalog/hooks/useMeatPricing";
import { GlobalPriceList } from "@/features/catalog/components/GlobalPriceList";

export default function MeatPricing() {
  const { prices, isLoading, handlePriceChange, handleSave, isSaving } = useMeatPricing();

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Global Meat Pricing</h1>
            <p className="text-muted-foreground">Set daily prices for all meat centers across the platform.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Daily Prices
          </Button>
        </div>

        <GlobalPriceList prices={prices} isLoading={isLoading} onPriceChange={handlePriceChange} />

        <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl">
          <p className="text-sm text-blue-600 font-medium">
            💡 <strong>Note:</strong> Changes made here will instantly update the price for every Meat Center on the platform. Individual vendors cannot override these prices, but they can mark items as
            out-of-stock.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
