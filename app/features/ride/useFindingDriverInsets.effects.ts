import { router } from "expo-router";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { foodStageOf } from "@/contexts/foodStage";
import i18n from "@/i18n";
import { cancelOrder, getOrderJson } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";
import { cancellationNotice } from "@/utils/cancellationNotice";

// Lifted from useFindingDriverInsets; deps array stays with the call.
export const buildFindingDriverInsetsEffect = (orderId: any, isReserved: any, setBookingConfirmed: any, setConfirmedDriver: any, setStops: any, setOrderSummary: any) => () => {
    if (!orderId) {
      router.push("/(tabs)");
      return;
    }

    const isReservedVal = isReserved === "true";
    useDeliveryStore.getState().setOrderId(orderId);

    socketService.connect();
    socketService.trackOrder(orderId);

    let pollIntervalId: any;
    let isTransitioned = false;

    const handleTransition = (driverData: any) => {
      if (isTransitioned) return;
      isTransitioned = true;

      if (pollIntervalId) clearInterval(pollIntervalId);
      if (timeoutTimer) clearTimeout(timeoutTimer);

      const { setDriver, setStatus } = useDeliveryStore.getState();

      const driverInfo = driverData
        ? typeof driverData === "object"
          ? {
              id: driverData.id || driverData._id || "unknown",
              name: driverData.name || driverData.user?.name || "Driver",
              phone: driverData.phone || driverData.user?.phone || "",
              vehicle: driverData.vehicle || driverData.vehicleType || "unknown",
            }
          : { id: driverData, name: "Driver", phone: "", vehicle: "unknown" }
        : { id: "unknown", name: "Driver", phone: "", vehicle: "unknown" };

      setDriver(driverInfo);
      setStatus("driver_assigned");

      if (isReservedVal) {
        setConfirmedDriver(driverInfo);
        setBookingConfirmed(true);
      } else {
        // Replace, not push: once a rider is assigned, "Finding your rider" is done and
        // must not sit under tracking for back to return to.
        router.replace({ pathname: "/tracking", params: { orderId } });
      }
    };

    // `reason` is who cancelled it (backend cancelReason), so the popup names the
    // restaurant, the rider or the Adios team. It used to always say "Driver is
    // unavailable", even when the restaurant had turned the order down.
    const handleOrderCancelled = (reason?: string | null) => {
      if (isTransitioned) return;
      isTransitioned = true;
      if (pollIntervalId) clearInterval(pollIntervalId);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      router.replace("/(tabs)");
      // The customer cancelled it themselves (from this screen's Cancel) — nothing to announce.
      if (reason === "customer_cancelled") return;
      const notice = cancellationNotice(reason);
      setTimeout(() => {
        showAlert(notice.title, notice.message, undefined, "warning");
      }, 500);
    };

    const checkOrderStatus = async () => {
      if (isTransitioned) return;
      try {
        const orderData = await getOrderJson(orderId);
        if (orderData) {
          if (orderData.serviceType) useDeliveryStore.getState().setServiceType(orderData.serviceType);
          // Restaurant orders: waiting for the restaurant -> preparing -> rider assigned.
          useDeliveryStore.getState().setFoodStage(foodStageOf(orderData));
          setOrderSummary({
            totalPrice: orderData.totalPrice,
            totalDistance: orderData.totalDistance,
            duration: orderData.duration,
            serviceType: orderData.serviceType,
            // A restaurant / meat-shop order: the map marks the restaurant and the delivery home.
            hasOutlet: !!orderData.vendor,
          });
          if (orderData.stops && orderData.stops.length > 0) {
            const mappedStops = orderData.stops.map((s: any) => ({
              id: s._id,
              address: s.address,
              lat: s.location.coordinates[1],
              lng: s.location.coordinates[0],
              type: s.type,
              items: s.items?.lines || [],
            }));
            setStops((prev: any) => {
              if (prev && prev.length === mappedStops.length && prev.every((v: any, i: any) => v.id === mappedStops[i].id)) return prev;
              return mappedStops;
            });
          }
          if (orderData.status && orderData.status.toUpperCase() === "CANCELLED") {
            handleOrderCancelled(orderData.cancelReason);
            return;
          }
          if (orderData.status && orderData.status.toUpperCase() === "DRIVER_ASSIGNED") {
            handleTransition(orderData.driver);
          }
        }
      } catch (err) {
        console.error("Error checking order status:", err);
      }
    };

    checkOrderStatus();
    pollIntervalId = setInterval(checkOrderStatus, 2000);

    const handleOrderAccepted = (data: any) => {
      if (data && String(data.orderId) === String(orderId)) handleTransition(data.driver);
    };
    const handleStatusUpdate = (data: any) => {
      if (data && String(data.orderId) === String(orderId) && data.status?.toUpperCase() === "CANCELLED") handleOrderCancelled(data.reason);
    };

    socketService.on("order_accepted", handleOrderAccepted);
    socketService.on("order_status_update", handleStatusUpdate);

    let timeoutTimer: any;
    if (isReservedVal) {
      timeoutTimer = setTimeout(async () => {
        if (isTransitioned) return;
        isTransitioned = true;
        if (pollIntervalId) clearInterval(pollIntervalId);
        showAlert(
          i18n.t("app.ride.noCaptainFound"),
          i18n.t("app.ride.sorryNoCaptainsAreAvailableTo"),
          [{
            text: i18n.t("app.ride.ok"),
            onPress: async () => {
              router.replace("/(tabs)");
              if (orderId) {
                try {
                  await cancelOrder(orderId);
                } catch (error) {
                  console.error("Failed to cancel order on backend:", error);
                }
              }
            },
          }]
        );
      }, 60000);
    }

    return () => {
      socketService.off("order_accepted", handleOrderAccepted);
      socketService.off("order_status_update", handleStatusUpdate);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
};
