import { VendorLayout } from "@/components/layout/VendorLayout";
import { AlertCircle } from "lucide-react";
import { useVendorMeatMenu } from "@/features/vendors/hooks/useVendorMeatMenu";
import { VendorMeatMenuGrid } from "@/features/vendors/components/VendorMeatMenuGrid";

export default function VendorMeatMenu() {
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
          <h1 className="text-3xl font-bold text-foreground">Meat Inventory</h1>
          <p className="text-muted-foreground">Manage stock availability and update your daily prices.</p>
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
              <strong>Your daily controls:</strong> You can update the <strong>price</strong> and toggle
              <strong> availability</strong> for each item below.
            </p>
            <p>
              Item names, weights, and categories are managed by the Admin and cannot be changed.
              New items are added automatically by the Admin through global pricing updates.
            </p>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
