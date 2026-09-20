import { useEffect } from "react";
import { Share } from "react-native";

// Part 3 of useTracking, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useTrackingHandleShareTrip(status: any, currentOrderId: any, setOrderId: any, stops: any, driver: any, params: any, isRide: any, cancellationAlerted: any, handleOrderCancelledByDriver: any) {
  const handleShareTrip = async () => {
    try {
      await Share.share({
        message: `I'm on a Flavour ${isRide ? "ride" : "trip"}${driver?.name ? ` with ${driver.name}` : ""}. Heading to ${stops?.[stops.length - 1]?.address || "my destination"}.`,
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
