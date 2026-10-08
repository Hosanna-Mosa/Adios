import React from "react";
import { router } from "expo-router";
import i18n from "@/i18n";
import { showAlert } from "@/components/ui/AppAlert";
import { cancelOrder, getOrder } from "@/services/orders.service";
import { usePolling, type IsCurrent } from "@/utils/usePolling";
import { cancellationNotice } from "@/utils/cancellationNotice";
import { normalizeStatus } from "./useTracking.shared";

// Split out of useRideSearching so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

/** How often the searching screen re-checks the order for an assigned captain. */
const POLL_MS = 3000;

export function useRideSearchingShowTripDetails(currentOrderId: any, setGlobalDriver: any, setGlobalStatus: any, setTripDetailsVisible: any, setCancelReasonVisible: any, setCancelConfirmVisible: any, setSelectedCancelReason: any) {
  // Each outcome (assigned, cancelled, no captains) is acted on once per order.
  const settledFor = React.useRef<string | null>(null);

  const checkOrder = React.useCallback(async (isCurrent: IsCurrent) => {
    const orderId = currentOrderId;
    if (!orderId || settledFor.current === orderId) return;
    const order = await getOrder(orderId);
    if (!order || !isCurrent() || settledFor.current === orderId) return;

    const status = normalizeStatus(String(order.status || ""));
    if (status === "cancelled") {
      settledFor.current = orderId;
      router.replace("/(tabs)");
      if (order.cancelReason === "customer_cancelled") return;
      const notice = cancellationNotice(order.cancelReason);
      showAlert(notice.title, notice.message, undefined, "warning");
      return;
    }
    if (status !== "confirmed" && order.driver) {
      settledFor.current = orderId;
      const driver = {
        id: order.driver._id,
        name: order.driver.name || order.driver.user?.name || "Driver",
        phone: order.driver.phone || order.driver.user?.phone || "",
        vehicle: order.driver.vehicleType || "unknown",
        rating: order.driver.rating ?? null,
        ratingCount: order.driver.ratingCount ?? 0,
      };
      setGlobalDriver(driver);
      setGlobalStatus("driver_assigned");

      showAlert(i18n.t("app.orderStatusTimeline.steps.driverAssigned"), i18n.t("app.ride.varIsOnTheWay", { value: driver.name }), [
        {
          text: i18n.t("app.ride.ok"),
          onPress: () => {
            router.push("/tracking");
          }
        }
      ]);
      return;
    }
    if (order.dispatchExhaustedAt) {
      settledFor.current = orderId;
      showAlert(i18n.t("app.ride.noCaptainFound"), i18n.t("app.ride.noRidersAvailableNow"), [
        {
          text: i18n.t("app.ride.ok"),
          onPress: async () => {
            router.replace("/(tabs)");
            try {
              await cancelOrder(orderId);
            } catch (error) {
              console.error("Failed to cancel order on backend:", error);
            }
          },
        },
      ]);
    }
  }, [currentOrderId]);

  const { refresh, refreshing } = usePolling(checkOrder, POLL_MS, { enabled: !!currentOrderId });

  const showTripDetails = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(false);
    setTripDetailsVisible(true);
  };
  const showCancelReasons = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(true);
  };
  const selectCancelReason = (reason: string) => {
    setSelectedCancelReason(reason);
    setCancelReasonVisible(false);
    setCancelConfirmVisible(true);
  };

  return { showTripDetails, showCancelReasons, selectCancelReason, refresh, refreshing };
}
