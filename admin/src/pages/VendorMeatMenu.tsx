import { VendorLayout } from "@/components/layout/VendorLayout";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVendorMeatMenu } from "@/features/vendors/hooks/useVendorMeatMenu";
import { VendorMeatMenuGrid } from "@/features/vendors/components/VendorMeatMenuGrid";

export default function VendorMeatMenu() {
  const { t } = useTranslation();
  const {
    menu,
    isLoading,
    editingId,
    editPrice,
    setEditPrice,
    isToggling,
    isSavingPrice,
    toggleAvailability,
    startEditing,
    cancelEditing,
    savePrice,
  } = useVendorMeatMenu();

  return (
    <VendorLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("vendorMeatMenu.meatInventory")}</h1>
          <p className="text-muted-foreground">{t("vendorMeatMenu.manageStockAndPrices")}</p>
        </div>

        <VendorMeatMenuGrid
          isLoading={isLoading}
          menu={menu}
          editingId={editingId}
          editPrice={editPrice}
          setEditPrice={setEditPrice}
          isToggling={isToggling}
          isSavingPrice={isSavingPrice}
          onToggleAvailability={toggleAvailability}
          startEditing={startEditing}
          cancelEditing={cancelEditing}
          savePrice={savePrice}
        />

        <div className="bg-muted/30 p-6 rounded-2xl flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>{t("vendorMeatMenu.yourDailyControlsColon")}</strong> {t("vendorMeatMenu.dailyControlsDesc")}
            </p>
            <p>{t("vendorMeatMenu.itemsManagedByAdminDesc")}</p>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
