import { useEffect } from "react";
import { Share } from "react-native";
import { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

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

  // Radar / pulse animation shown only while no driver is assigned yet.
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  useEffect(() => {
    if (driver) return;
    // Each pulse loops its own [pause, animate] cycle — pulse2's 1000ms pause
    // before every animation is what staggers it relative to pulse1.
    pulse1.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
    pulse2.value = withRepeat(withSequence(withTiming(0, { duration: 1000 }), withTiming(1, { duration: 2000 })), -1, false);
  }, [driver, pulse1, pulse2]);

  const pulse1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse1.value, [0, 1], [1, 2.2]) }],
    opacity: interpolate(pulse1.value, [0, 1], [0.5, 0]),
  }));
  const pulse2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse2.value, [0, 1], [1, 2.2]) }],
    opacity: interpolate(pulse2.value, [0, 1], [0.5, 0]),
  }));

  useEffect(() => {
    if (cancellationAlerted.current) return;
    if (params.orderId && params.orderId !== currentOrderId) setOrderId(params.orderId);
  }, [params.orderId, currentOrderId]);

  useEffect(() => {
    if (status === "cancelled") handleOrderCancelledByDriver();
  }, [status]);

  const deliveryStop = stops?.find((s: any) => s.type?.toLowerCase() === "delivery" || s.type?.toLowerCase() === "drop");

  return { handleShareTrip, pulse1Style, pulse2Style, deliveryStop };
}
