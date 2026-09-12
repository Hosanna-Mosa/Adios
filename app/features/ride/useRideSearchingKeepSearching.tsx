import { router } from "expo-router";
import { cancelOrder } from "@/services/orders.service";

// Split out of useRideSearching so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRideSearchingKeepSearching(currentOrderId: any, setCurrentOrderId: any, params: any, setTripDetailsVisible: any, setCancelReasonVisible: any, setCancelConfirmVisible: any, fare: any) {
  const keepSearching = () => {
    setCancelConfirmVisible(false);
    setCancelReasonVisible(false);
  };
  const cancelRide = async () => {
    const orderIdToCancel = currentOrderId;
    setCancelConfirmVisible(false);
    setCancelReasonVisible(false);
    setTripDetailsVisible(false);
    setCurrentOrderId(null);
    router.push("/(tabs)");

    if (orderIdToCancel) {
      try {
        await cancelOrder(orderIdToCancel);
      } catch (error) {
        console.error("Failed to cancel order on backend:", error);
      }
    }
  };
  /* void [
      `${params.pickupName}\n\nTo\n\n${params.dropName}\n\nRide: ${params.rideName || "Bike Ride"}\nFare: ₹${fare}`,

  ]; */



  return { keepSearching, cancelRide };
}
