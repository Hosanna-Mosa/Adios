import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { cancelOrder } from "@/services/orders.service";
import { getNearbyDrivers } from "@/services/places.service";

// Split out of useFindingDriver so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useFindingDriverShowCancelSheet(orderId: any, stops: any, setOnlineDrivers: any, orderSummary: any) {
  const { t } = useTranslation();

  const TIER_LABEL: Record<string, string> = useMemo(() => ({
    bike: t("app.rideTierNames.bike"),
    auto: t("app.rideTierNames.auto"),
    cab: t("app.rideTierNames.cab"),
    cab_prime: t("app.rideTierNames.cabPrime"),
  }), [t]);

  const CANCEL_REASONS = useMemo(() => [
    t("app.findingDriver.cancelReasons.waitingTooLong"),
    t("app.findingDriver.cancelReasons.bookedByMistake"),
    t("app.findingDriver.cancelReasons.fareTooHigh"),
    t("app.findingDriver.cancelReasons.foundAnotherRide"),
    t("app.findingDriver.cancelReasons.other"),
  ], [t]);

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
          // Only a captain's own live position is drawn. This used to fall back to
          // their saved home address and then to the pickup point itself, so a
          // captain with no GPS fix still appeared on the map — sometimes sitting
          // exactly on the pickup pin, which reads as a captain already waiting.
          const mapped = res
            .map((drv) => {
              const coords = drv.currentLocation?.coordinates;
              const lng = Number(coords?.[0]);
              const lat = Number(coords?.[1]);
              if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
                return null;
              }
              return {
                id: drv._id,
                lat,
                lng,
                vehicleType: drv.vehicleType || "bike",
                name: drv.user?.name || "Driver",
              };
            })
            .filter(Boolean) as { id: string; lat: number; lng: number; vehicleType: string; name: string }[];
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

  return { showCancelSheet, setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel, CANCEL_REASONS };
}
