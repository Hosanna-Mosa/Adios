import React from "react";
import { customFetch } from "@/utils/api/custom-fetch";
import { FareEstimate, normalizeServiceType } from "./usePickupConfirmation.shared";

// Part 2 of usePickupConfirmation, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

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
        const result = await customFetch<FareEstimate>(
          `/orders/estimate-fare?${query.toString()}`,
          { responseType: "json" },
        );
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
