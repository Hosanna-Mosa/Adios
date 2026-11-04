import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { cancelOrder } from "@/services/orders.service";
import { fetchNearbyDriverPins } from "@/utils/nearbyDrivers";
import { setForegroundInterval } from "@/utils/foregroundInterval";

// Split out of useFindingDriver so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useFindingDriverShowCancelSheet(orderId: any, stops: any, setOnlineDrivers: any, orderSummary: any, isRide: boolean) {
  const { t } = useTranslation();

  const TIER_LABEL: Record<string, string> = useMemo(() => ({
    bike: t("app.rideTierNames.bike"),
    auto: t("app.rideTierNames.auto"),
    cab: t("app.rideTierNames.cab"),
    cab_prime: t("app.rideTierNames.cabPrime"),
  }), [t]);

  // "Fare"/"ride" wording only makes sense for an actual ride order — a Meat/Food/
  // package order gets price- and order-appropriate reasons instead.
  const CANCEL_REASONS = useMemo(() => [
    t("app.findingDriver.cancelReasons.waitingTooLong"),
    t("app.findingDriver.cancelReasons.bookedByMistake"),
    isRide ? t("app.findingDriver.cancelReasons.fareTooHigh") : t("app.findingDriver.cancelReasons.priceTooHigh"),
    isRide ? t("app.findingDriver.cancelReasons.foundAnotherRide") : t("app.findingDriver.cancelReasons.changedMind"),
    t("app.findingDriver.cancelReasons.other"),
  ], [t, isRide]);

  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);

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
        const pins = await fetchNearbyDriverPins(pickupStop.lat, pickupStop.lng, { radius: 50000 });
        if (active) setOnlineDrivers(pins);
      } catch (error) {
        console.error("Failed to fetch nearby drivers in finding-driver:", error);
      }
    };

    fetchOnlineDrivers();
    const stopPolling = setForegroundInterval(fetchOnlineDrivers, 10000);
    return () => { active = false; stopPolling(); };
  }, [stops]);

  const pickupStop = stops.find((s: any) => s.type === "pickup");
  const dropStop = stops.find((s: any) => s.type === "drop");
  const tierLabel = orderSummary.serviceType ? TIER_LABEL[orderSummary.serviceType] || orderSummary.serviceType : null;

  return { showCancelSheet, setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel, CANCEL_REASONS };
}
