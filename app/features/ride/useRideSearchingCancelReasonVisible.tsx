import React from "react";
import { normalizeServiceType } from "./useRideSearching.shared";
import { getNearbyDrivers } from "@/services/places.service";

// Split out of useRideSearching so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideSearchingCancelReasonVisible(params: any) {
  const [cancelReasonVisible, setCancelReasonVisible] = React.useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = React.useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = React.useState("");

  interface OnlineDriver {
    _id: string;
    currentLocation?: {
      coordinates: [number, number];
    };
    vehicleType?: "bike" | "auto" | "car";
  }

  const [onlineDrivers, setOnlineDrivers] = React.useState<OnlineDriver[]>([]);

  const pickupCoords = React.useMemo(
    () => ({
      latitude: parseFloat(params.pickupLat || "0"),
      longitude: parseFloat(params.pickupLng || "0"),
    }),
    [params.pickupLat, params.pickupLng],
  );
  const dropCoords = React.useMemo(
    () => ({
      latitude: parseFloat(params.dropLat || "0"),
      longitude: parseFloat(params.dropLng || "0"),
    }),
    [params.dropLat, params.dropLng],
  );

  React.useEffect(() => {
    let active = true;
    const fetchOnlineDrivers = async () => {
      try {
        const service = normalizeServiceType(params.serviceId);
        console.log(`[CLIENT DRIVER SEARCH] Request coordinates: [lat: ${pickupCoords.latitude}, lng: ${pickupCoords.longitude}], vehicleType: ${service}`);
        const queryParams = new URLSearchParams({
          latitude: String(pickupCoords.latitude),
          longitude: String(pickupCoords.longitude),
          radius: "5000",
          vehicleType: service,
        });
        const res = await getNearbyDrivers<OnlineDriver[]>(queryParams.toString());
        console.log(`[CLIENT DRIVER SEARCH RESPONSE] Returned count: ${res ? res.length : 0}, data: ${JSON.stringify(res)}`);
        if (active && Array.isArray(res)) {
          setOnlineDrivers(res);
        }
      } catch (error) {
        console.error("Failed to fetch nearby drivers:", error);
      }
    };

    fetchOnlineDrivers();
    const interval = setInterval(fetchOnlineDrivers, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pickupCoords.latitude, pickupCoords.longitude, params.serviceId]);

  return { cancelReasonVisible, setCancelReasonVisible, cancelConfirmVisible, setCancelConfirmVisible, selectedCancelReason, setSelectedCancelReason, onlineDrivers, pickupCoords, dropCoords };
}
