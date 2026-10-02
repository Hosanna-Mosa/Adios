import { router } from "expo-router";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import i18n from "@/i18n";
import { cancelOrder, getOrderJson } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";

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
        router.push({ pathname: "/tracking", params: { orderId } });
      }
    };

    const handleOrderCancelled = () => {
      if (isTransitioned) return;
      isTransitioned = true;
      if (pollIntervalId) clearInterval(pollIntervalId);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      router.replace("/(tabs)");
      setTimeout(() => {
        showAlert(i18n.t("app.ride.orderCancelled"), i18n.t("app.ride.driverIsUnavailable"));
      }, 500);
    };

    const checkOrderStatus = async () => {
      if (isTransitioned) return;
      try {
        const orderData = await getOrderJson(orderId);
        if (orderData) {
          if (orderData.serviceType) useDeliveryStore.getState().setServiceType(orderData.serviceType);
          setOrderSummary({
            totalPrice: orderData.totalPrice,
            totalDistance: orderData.totalDistance,
            duration: orderData.duration,
            serviceType: orderData.serviceType,
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
            handleOrderCancelled();
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
      if (data && String(data.orderId) === String(orderId) && data.status?.toUpperCase() === "CANCELLED") handleOrderCancelled();
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
