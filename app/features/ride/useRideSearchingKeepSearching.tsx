import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";

// Part 5 of useRideSearching, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

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
        await customFetch(`/orders/${orderIdToCancel}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "CANCELLED" }),
        });
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
