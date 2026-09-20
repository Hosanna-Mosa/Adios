import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { ENABLED_TIERS } from "./useRideConfirmation.shared";
import { showAlert } from "@/components/ui/AppAlert";
import { useDeliveryStore } from "@/contexts/deliveryStore";

// Part 5 of useRideConfirmation, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useRideConfirmationPlaceOrder(params: any, selectedTier: any, tierFares: any, setBooking: any, setShowDatePicker: any, setConfirmedReservation: any, pickupCoords: any, dropCoords: any, stops: any) {
  const { setOrderId, setServiceType, setStatus } = useDeliveryStore();

  const placeOrder = async (isReserved: boolean, reservedAt?: Date) => {
    setBooking(true);
    try {
      const orderStops = [
        { address: params.pickupName, latitude: pickupCoords.latitude, longitude: pickupCoords.longitude, type: "pickup" },
        ...stops.map((s: any) => ({ address: s.name, latitude: s.lat, longitude: s.lng, type: "stop" })),
        { address: params.dropName, latitude: dropCoords.latitude, longitude: dropCoords.longitude, type: "drop" },
      ];
      const res = await customFetch<{ _id: string }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          stops: orderStops,
          serviceType: selectedTier,
          isReserved,
          reservedAt: isReserved ? reservedAt?.toISOString() : undefined,
          bookingFor: {
            type: params.bookingForType === "someone_else" ? "someone_else" : "myself",
            contactNumber: params.bookingForType === "someone_else" ? params.riderContact : undefined,
          },
        }),
      });

      if (isReserved) {
        setShowDatePicker(false);
        setConfirmedReservation({
          tierName: ENABLED_TIERS.find((t) => t.id === selectedTier)?.name,
          dateTimeStr: reservedAt?.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          timeStr: reservedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          fare: tierFares[selectedTier]?.fareBreakdown?.total,
          pickupName: params.pickupName,
          dropName: params.dropName,
        });
      } else {
        // Tracked globally the instant it's created, the same way food/delivery/
        // helper bookings already are — otherwise backing out of "Finding your
        // captain" left the app with no record the ride ever existed, and no way
        // back into it (see the active-order stripe above the tab bar).
        setOrderId(res._id);
        setServiceType(selectedTier);
        setStatus("confirmed");
        router.push({ pathname: "/finding-driver", params: { orderId: res._id } });
      }
    } catch (e: any) {
      showAlert("Booking failed", e.message);
    } finally {
      setBooking(false);
    }
  };

  return { placeOrder };
}
