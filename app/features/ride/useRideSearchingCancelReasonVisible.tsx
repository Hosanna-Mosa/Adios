import React from "react";
import { normalizeServiceType } from "./useRideSearching.shared";
import { fetchNearbyDriverPins, type NearbyDriverPin } from "@/utils/nearbyDrivers";
import { setForegroundInterval } from "@/utils/foregroundInterval";

// Split out of useRideSearching so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideSearchingCancelReasonVisible(params: any) {
  const [cancelReasonVisible, setCancelReasonVisible] = React.useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = React.useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = React.useState("");

  const [onlineDrivers, setOnlineDrivers] = React.useState<NearbyDriverPin[]>([]);

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
        const pins = await fetchNearbyDriverPins(pickupCoords.latitude, pickupCoords.longitude, {
          radius: 5000,
          vehicleType: normalizeServiceType(params.serviceId),
        });
        if (active) setOnlineDrivers(pins);
      } catch (error) {
        console.error("Failed to fetch nearby drivers:", error);
      }
    };

    fetchOnlineDrivers();
    const stopPolling = setForegroundInterval(fetchOnlineDrivers, 10000);

    return () => {
      active = false;
      stopPolling();
    };
  }, [pickupCoords.latitude, pickupCoords.longitude, params.serviceId]);

  return { cancelReasonVisible, setCancelReasonVisible, cancelConfirmVisible, setCancelConfirmVisible, selectedCancelReason, setSelectedCancelReason, onlineDrivers, pickupCoords, dropCoords };
}
