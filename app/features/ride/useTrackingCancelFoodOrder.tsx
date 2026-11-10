import { useState } from "react";
import { useTranslation } from "react-i18next";
import { showAlert } from "@/components/ui/AppAlert";
import { cancelOrder } from "@/services/orders.service";

// Food orders (restaurant, not meat) can be cancelled from tracking until the
// delivery partner has picked the food up. After that it is on its way.
const CANCELLABLE_STATUSES = ["driver_assigned", "en_route_pickup", "arrived_pickup", "picking_items"];

export function useTrackingCancelFoodOrder(
  currentOrderId: string | null,
  status: string,
  isFoodOrder: boolean,
  onCancelled: (reason?: string | null) => void,
) {
  const { t } = useTranslation();
  const [cancelling, setCancelling] = useState(false);
  const canCancelFoodOrder = isFoodOrder && !!currentOrderId && CANCELLABLE_STATUSES.includes(status);

  const handleCancelFoodOrder = () => {
    if (!currentOrderId || cancelling) return;
    showAlert(t("app.foodOrder.cancelTitle"), t("app.foodOrder.cancelBody"), [
      { text: t("app.foodOrder.keepOrder"), style: "cancel" },
      {
        text: t("app.foodOrder.cancelOrder"),
        style: "destructive",
        onPress: async () => {
          try {
            setCancelling(true);
            await cancelOrder(currentOrderId);
            // Same exit as any cancellation: clear the order and go Home, without a notice.
            onCancelled("customer_cancelled");
          } catch (err: any) {
            showAlert(t("app.foodOrder.couldntCancel"), err?.message || t("app.ride.pleaseTryAgain"));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return { canCancelFoodOrder, handleCancelFoodOrder };
}
