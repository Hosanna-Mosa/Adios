import { useEffect } from "react";
import { Share } from "react-native";

// Split out of useTracking so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useTrackingHandleShareTrip(status: any, currentOrderId: any, setOrderId: any, stops: any, driver: any, params: any, isRide: any, cancellationAlerted: any, handleOrderCancelledByDriver: any) {
  const handleShareTrip = async () => {
    try {
      await Share.share({
        message: `I'm on an Adios ${isRide ? "ride" : "trip"}${driver?.name ? ` with ${driver.name}` : ""}. Heading to ${stops?.[stops.length - 1]?.address || "my destination"}.`,
      });
    } catch {
      // user dismissed the share sheet
    }
  };

  useEffect(() => {
    if (cancellationAlerted.current) return;
    if (params.orderId && params.orderId !== currentOrderId) setOrderId(params.orderId);
  }, [params.orderId, currentOrderId]);

  useEffect(() => {
    if (status === "cancelled") handleOrderCancelledByDriver();
  }, [status]);

  const deliveryStop = stops?.find((s: any) => s.type?.toLowerCase() === "delivery" || s.type?.toLowerCase() === "drop");

  return { handleShareTrip, deliveryStop };
}
