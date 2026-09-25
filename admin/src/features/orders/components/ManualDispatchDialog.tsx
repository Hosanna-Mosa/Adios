import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ManualOrderForm } from "../liveOrdersTypes";

interface ManualDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manualOrder: ManualOrderForm;
  setManualOrder: (order: ManualOrderForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** The "Manual Order Dispatch" modal on LiveOrders.tsx. */
export function ManualDispatchDialog({ open, onOpenChange, manualOrder, setManualOrder, onSubmit }: ManualDispatchDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("orders.manualOrderDispatch")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("orders.customerName")}</label>
            <Input
              value={manualOrder.customer}
              onChange={e => setManualOrder({...manualOrder, customer: e.target.value})}
              placeholder={t("orders.customerNamePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("orders.pickupLocationStoreRestaurant")}</label>
            <Input
              value={manualOrder.pickup}
              onChange={e => setManualOrder({...manualOrder, pickup: e.target.value})}
              placeholder={t("orders.pickupLocationPlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("orders.dropoffDestination")}</label>
            <Input
              value={manualOrder.dropoff}
              onChange={e => setManualOrder({...manualOrder, dropoff: e.target.value})}
              placeholder={t("orders.dropoffDestinationPlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("orders.estimatedDeliveryFare")}</label>
            <Input
              value={manualOrder.deliveryFee}
              onChange={e => setManualOrder({...manualOrder, deliveryFee: e.target.value})}
              placeholder="150"
            />
          </div>
          <Button type="submit" className="w-full mt-4 bg-primary text-primary-foreground">
            {t("orders.dispatchOrder")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
