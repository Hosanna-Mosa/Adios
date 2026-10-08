import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useAuthStore } from "@/contexts/authStore";
import { socketService } from "@/utils/socketService";
import { showAlert } from "@/components/ui/AppAlert";
import { nextFoodStage, normalizeStatus } from "@/features/ride/useTracking.shared";

export function GlobalSocketHandler() {
  const currentOrderId = useDeliveryStore((s) => s.currentOrderId);
  const addChatMessage = useDeliveryStore((s) => s.addChatMessage);
  const incrementUnreadCount = useDeliveryStore((s) => s.incrementUnreadCount);
  const setStatus = useDeliveryStore((s) => s.setStatus);
  const setDriver = useDeliveryStore((s) => s.setDriver);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  // Connection and user room joining effect
  useEffect(() => {
    if (!user) return;

    socketService.connect();
    socketService.emit("join", { userId: user.id || user._id, role: "CUSTOMER" });

    const onUpcomingReservedRide = (data: any) => {
      console.log("Customer received upcoming reserved ride:", data);
      showAlert(
        t("app.GlobalSocketHandler.upcomingReservedRide"),
        t("app.GlobalSocketHandler.yourReservedRideWithVarStarts", { value: data.driverName }),
        [
          {
            text: t("app.GlobalSocketHandler.trackDriver"),
            onPress: () => {
              useDeliveryStore.setState({
                currentOrderId: data.orderId,
                serviceType: data.serviceType,
                status: "driver_assigned",
              });
              router.push("/tracking");
            }
          }
        ]
      );
    };

    socketService.on("upcoming_reserved_ride", onUpcomingReservedRide);

    return () => {
      socketService.off("upcoming_reserved_ride", onUpcomingReservedRide);
    };
  }, [user]);

  // Chat messages and order tracking effect
  useEffect(() => {
    if (!currentOrderId) return;

    socketService.connect();
    socketService.trackOrder(currentOrderId);

    const onMessage = (msg: any) => {
      const formattedMsg = {
        id: msg.id || (Date.now().toString() + Math.random().toString()),
        text: msg.text,
        sender: msg.from === "driver" ? ("driver" as const) : ("customer" as const),
        timestamp: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const store = useDeliveryStore.getState();
      const currentMessages = store.activeChat || [];
      if (!currentMessages.find((m: any) => m.id === formattedMsg.id)) {
        addChatMessage(formattedMsg);
      }

      // Only increment unread count for driver messages when user is not actively chatting
      if (msg.from === "driver" && !store.isChatActive) {
        incrementUnreadCount();
      }
    };

    socketService.on("receive_message", onMessage);

    // Keeps the order's status current in the background — needed for the
    // active-order stripe on the tab bar, which reads it while the customer is
    // away from the tracking screen. Without this, `status` was only ever
    // refreshed while tracking.tsx itself was mounted, so it went stale the
    // moment the customer navigated back to Home, and a since-finished order
    // could keep showing as "in progress" indefinitely.
    // order_accepted also reaches the customer's user room, for any of their orders.
    const isOther = (data: any) => data?.orderId != null && String(data.orderId) !== String(currentOrderId);
    const onOrderAccepted = (data: any) => {
      if (isOther(data)) return;
      if (data?.driver) setDriver(data.driver);
      setStatus("driver_assigned");
      useDeliveryStore.getState().setFoodStage(null);
    };
    const onOrderStatusUpdate = (data: any) => {
      if (!data?.status || isOther(data)) return;
      const statusStr = String(data.status).toLowerCase();
      if (statusStr === "cancelled" || statusStr === "cancelled_by_driver") {
        // Before the status: screens reacting to "cancelled" read who did it from here.
        useDeliveryStore.getState().setCancelReason(data.reason ?? null);
        setStatus("cancelled");
        return;
      }
      setStatus(normalizeStatus(data.status));
      const store = useDeliveryStore.getState();
      store.setFoodStage(nextFoodStage(store.foodStage, data.status));
    };
    const onOrderCancelled = () => setStatus("cancelled");

    socketService.on("order_accepted", onOrderAccepted);
    socketService.on("order_status_update", onOrderStatusUpdate);
    socketService.on("order_cancelled", onOrderCancelled);

    return () => {
      socketService.off("receive_message", onMessage);
      socketService.off("order_accepted", onOrderAccepted);
      socketService.off("order_status_update", onOrderStatusUpdate);
      socketService.off("order_cancelled", onOrderCancelled);
    };
  }, [currentOrderId]);

  return null;
}
