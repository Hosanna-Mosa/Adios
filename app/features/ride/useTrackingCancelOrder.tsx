import { useState } from "react";
import { useTranslation } from "react-i18next";
import { showAlert } from "@/components/ui/AppAlert";
import { cancelOrder } from "@/services/orders.service";

export type CancelKind = "food" | "ride" | "package" | "helper";

// How long the customer may still cancel from Tracking, per service. Lower-case statuses,
// as the tracking screen holds them.
//  - ride:    until the ride has started (the captain is heading to / waiting at the pickup)
//  - package: until the captain has picked the package up
//  - helper:  until the helper has reached the address
//  - food:    until the delivery partner has picked the food up
const CANCELLABLE: Record<CancelKind, string[]> = {
  ride: ["confirmed", "driver_assigned", "en_route_pickup", "arrived_pickup"],
  package: ["confirmed", "driver_assigned", "en_route_pickup", "arrived_pickup"],
  helper: ["confirmed", "driver_assigned", "en_route_pickup"],
  food: ["driver_assigned", "en_route_pickup", "arrived_pickup", "picking_items"],
};

export function useTrackingCancelOrder(
  currentOrderId: string | null,
  status: string,
  kind: CancelKind | null,
  onCancelled: (reason?: string | null) => void,
) {
  const { t } = useTranslation();
  const [cancelling, setCancelling] = useState(false);
  const canCancel = !!kind && !!currentOrderId && CANCELLABLE[kind].includes(String(status).toLowerCase());

  const handleCancel = () => {
    if (!currentOrderId || !kind || cancelling) return;
    const copy: Record<CancelKind, { title: string; body: string; keep: string; confirm: string }> = {
      food: {
        title: t("app.foodOrder.cancelTitle"),
        body: t("app.foodOrder.cancelBody"),
        keep: t("app.foodOrder.keepOrder"),
        confirm: t("app.foodOrder.cancelOrder"),
      },
      ride: {
        title: t("app.tracking.cancelRideTitle", "Cancel this ride?"),
        body: t("app.tracking.cancelRideBody", "You can cancel until your ride starts. If you paid online, the amount will be refunded."),
        keep: t("app.tracking.keepRide", "Keep ride"),
        confirm: t("app.tracking.cancelRide", "Cancel ride"),
      },
      package: {
        title: t("app.tracking.cancelPackageTitle", "Cancel this delivery?"),
        body: t("app.tracking.cancelPackageBody", "Your package hasn't been picked up yet. If you paid online, the amount will be refunded."),
        keep: t("app.tracking.keepDelivery", "Keep delivery"),
        confirm: t("app.tracking.cancelDelivery", "Cancel delivery"),
      },
      helper: {
        title: t("app.tracking.cancelHelperTitle", "Cancel this booking?"),
        body: t("app.tracking.cancelHelperBody", "Your helper hasn't reached the address yet. If you paid online, the amount will be refunded."),
        keep: t("app.tracking.keepBooking", "Keep booking"),
        confirm: t("app.tracking.cancelBooking", "Cancel booking"),
      },
    };
    const c = copy[kind];
    showAlert(c.title, c.body, [
      { text: c.keep, style: "cancel" },
      {
        text: c.confirm,
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

  return { canCancel, handleCancel, cancelling };
}
