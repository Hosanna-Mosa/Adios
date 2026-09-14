import React from "react";
import { customFetch } from "@/utils/api/custom-fetch";
import { normalizeServiceType, parseFare } from "./useRideSearching.shared";
import { showAlert } from "@/components/ui/AppAlert";

// Part 3 of useRideSearching, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

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
        const order = await customFetch<any>("/orders", {
          method: "POST",
          responseType: "json",
          body: JSON.stringify({
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
          }),
        });

        const id = order?._id || order?.id;
        if (id) {
          setCurrentOrderId(id);
          setGlobalServiceType(normalizeServiceType(params.serviceId));
        }
      } catch (error: any) {
        console.error("Create ride order error:", error);
        showAlert("Ride request", error?.message || "Could not request this ride.");
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
