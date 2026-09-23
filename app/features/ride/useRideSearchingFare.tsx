import React from "react";
import { Alert } from "react-native";
import { normalizeServiceType, parseFare } from "./useRideSearching.shared";
import i18n from "@/i18n";
import { createOrder } from "@/services/orders.service";

// Split out of useRideSearching so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideSearchingFare(setCurrentOrderId: any, setGlobalServiceType: any, mapRef: any, params: any, selectedCancelReason: any, pickupCoords: any, dropCoords: any) {
  const fare = parseFare(params.fareTotal, params.ridePrice);
  const pickupTitle = String(params.pickupName || "Pickup").split(",")[0];
  const dropTitle = String(params.dropName || "Drop").split(",")[0];
  const cancelUsesDrop = selectedCancelReason.toLowerCase().includes("drop");
  const cancelLocationTitle = cancelUsesDrop ? dropTitle : pickupTitle;
  const cancelLocationAddress = cancelUsesDrop ? params.dropName : params.pickupName;
  const cancelLocationLabel = cancelUsesDrop ? "drop" : "pickup";

  const fitTripMarkers = React.useCallback(() => {
    const validCoords =
      Number.isFinite(pickupCoords.latitude) &&
      Number.isFinite(pickupCoords.longitude) &&
      Number.isFinite(dropCoords.latitude) &&
      Number.isFinite(dropCoords.longitude);

    if (!validCoords) return;

    mapRef.current?.fitToCoordinates([pickupCoords, dropCoords], {
      edgePadding: { top: 48, right: 90, bottom: 56, left: 90 },
      animated: false,
    });
  }, [dropCoords, pickupCoords]);

  React.useEffect(() => {
    const timer = setTimeout(fitTripMarkers, 250);
    return () => clearTimeout(timer);
  }, [fitTripMarkers]);

  React.useEffect(() => {
    const createRideOrder = async () => {
      try {
        const order = await createOrder<any>({
            serviceType: normalizeServiceType(params.serviceId),
            stops: [
              {
                address: params.pickupName,
                latitude: pickupCoords.latitude,
                longitude: pickupCoords.longitude,
                type: "pickup",
              },
              {
                address: params.dropName,
                latitude: dropCoords.latitude,
                longitude: dropCoords.longitude,
                type: "drop",
              },
            ],
          });

        const id = order?._id || order?.id;
        if (id) {
          setCurrentOrderId(id);
          setGlobalServiceType(normalizeServiceType(params.serviceId));
        }
      } catch (error: any) {
        console.error("Create ride order error:", error);
        Alert.alert(i18n.t("app.ride.rideRequest"), error?.message || "Could not request this ride.");
      }
    };

    createRideOrder();
  }, [
    dropCoords.latitude,
    dropCoords.longitude,
    params.dropName,
    params.pickupName,
    params.serviceId,
    pickupCoords.latitude,
    pickupCoords.longitude,
    setCurrentOrderId,
    setGlobalServiceType,
  ]);

  return { fare, pickupTitle, dropTitle, cancelUsesDrop, cancelLocationTitle, cancelLocationAddress, cancelLocationLabel, fitTripMarkers };
}
