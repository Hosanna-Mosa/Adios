import { Alert } from "react-native";
import { router } from "expo-router";
import { ENABLED_TIERS } from "./useRideConfirmation.shared";
import { createOrder } from "@/services/orders.service";

// Split out of useRideConfirmation so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideConfirmationPlaceOrder(params: any, selectedTier: any, tierFares: any, setBooking: any, setShowDatePicker: any, setConfirmedReservation: any, pickupCoords: any, dropCoords: any, stops: any) {
  const placeOrder = async (isReserved: boolean, reservedAt?: Date) => {
    setBooking(true);
    try {
      const orderStops = [
        { address: params.pickupName, latitude: pickupCoords.latitude, longitude: pickupCoords.longitude, type: "pickup" },
        ...stops.map((s: any) => ({ address: s.name, latitude: s.lat, longitude: s.lng, type: "stop" })),
        { address: params.dropName, latitude: dropCoords.latitude, longitude: dropCoords.longitude, type: "drop" },
      ];
      const res = await createOrder({
          stops: orderStops,
          serviceType: selectedTier,
          isReserved,
          reservedAt: isReserved ? reservedAt?.toISOString() : undefined,
          bookingFor: {
            type: params.bookingForType === "someone_else" ? "someone_else" : "myself",
            contactNumber: params.bookingForType === "someone_else" ? params.riderContact : undefined,
          },
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
        router.push({ pathname: "/finding-driver", params: { orderId: res._id } });
      }
    } catch (e: any) {
      Alert.alert("Booking failed", e.message);
    } finally {
      setBooking(false);
    }
  };

  return { placeOrder };
}
