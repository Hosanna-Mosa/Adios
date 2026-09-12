import React from "react";
import { FareEstimate, normalizeServiceType } from "./usePickupConfirmation.shared";
import { estimateFare } from "@/services/orders.service";

// Split out of usePickupConfirmation so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function usePickupConfirmationLoadingEstimate(params: any, confirmedPickup: any, estimate: any, setEstimate: any) {
  const [loadingEstimate, setLoadingEstimate] = React.useState(false);

  React.useEffect(() => {
    const canEstimate =
      Number.isFinite(confirmedPickup.coords.latitude) &&
      Number.isFinite(confirmedPickup.coords.longitude) &&
      Number.isFinite(Number(params.dropLat)) &&
      Number.isFinite(Number(params.dropLng));

    if (!canEstimate) return;

    const loadEstimate = async () => {
      setLoadingEstimate(true);
      try {
        const query = new URLSearchParams({
          pickupLat: String(confirmedPickup.coords.latitude),
          pickupLng: String(confirmedPickup.coords.longitude),
          dropLat: String(params.dropLat),
          dropLng: String(params.dropLng),
          serviceType: normalizeServiceType(params.serviceId),
        });
        const result = await estimateFare<FareEstimate>(query.toString());
        setEstimate(result);
      } catch (error) {
        console.error("Pickup estimate error:", error);
      } finally {
        setLoadingEstimate(false);
      }
    };

    loadEstimate();
  }, [
    params.dropLat,
    params.dropLng,
    params.serviceId,
    confirmedPickup.coords.latitude,
    confirmedPickup.coords.longitude,
  ]);

  return { loadingEstimate };
}
