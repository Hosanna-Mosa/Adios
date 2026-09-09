import { useEffect, useState } from "react";
import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { CANCEL_REASONS, TIER_LABEL } from "./useFindingDriver.shared";

// Part 2 of useFindingDriver, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useFindingDriverShowCancelSheet(orderId: any, stops: any, setOnlineDrivers: any, orderSummary: any) {
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  const handleCancel = async () => {
    setShowCancelSheet(false);
    router.push("/(tabs)");
    if (orderId) {
      try {
        await customFetch(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
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
        const res = await customFetch<any[]>(`/drivers/nearby?${queryParams.toString()}`);
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
