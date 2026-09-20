import { useEffect, useState } from "react";
import { router } from "expo-router";
import { CANCEL_REASONS, TIER_LABEL } from "./useFindingDriver.shared";
import { cancelOrder } from "@/services/orders.service";
import { getNearbyDrivers } from "@/services/places.service";

// Split out of useFindingDriver so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useFindingDriverShowCancelSheet(orderId: any, stops: any, setOnlineDrivers: any, orderSummary: any) {
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  const handleCancel = async () => {
    setShowCancelSheet(false);
    router.push("/(tabs)");
    if (orderId) {
      try {
        await cancelOrder(orderId);
      } catch (error) {
        console.error("Failed to cancel order on backend:", error);
      }
    }
  };

  useEffect(() => {
    if (!stops || stops.length === 0) return;
    const pickupStop = stops.find((s: any) => s.type === "pickup") || stops[0];
    if (!pickupStop?.lat || !pickupStop?.lng) return;

    let active = true;
    const fetchOnlineDrivers = async () => {
      try {
        const queryParams = new URLSearchParams({ latitude: String(pickupStop.lat), longitude: String(pickupStop.lng), radius: "50000" });
        const res = await getNearbyDrivers(queryParams.toString());
        if (active && Array.isArray(res)) {
          const mapped = res
            .map((drv) => ({
              id: drv._id,
              lat: drv.currentLocation?.coordinates?.[1] || drv.user?.addresses?.[0]?.location?.coordinates?.[1] || pickupStop.lat,
              lng: drv.currentLocation?.coordinates?.[0] || drv.user?.addresses?.[0]?.location?.coordinates?.[0] || pickupStop.lng,
              vehicleType: drv.vehicleType || "bike",
              name: drv.user?.name || "Driver",
            }))
            .filter((d) => d.lat && d.lng);
          setOnlineDrivers(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch nearby drivers in finding-driver:", error);
      }
    };

    fetchOnlineDrivers();
    const interval = setInterval(fetchOnlineDrivers, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [stops]);

  const pickupStop = stops.find((s: any) => s.type === "pickup");
  const dropStop = stops.find((s: any) => s.type === "drop");
  const tierLabel = orderSummary.serviceType ? TIER_LABEL[orderSummary.serviceType] || orderSummary.serviceType : null;

  return { showCancelSheet, setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel };
}
