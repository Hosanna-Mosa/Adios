import { customFetch } from "@/utils/api/custom-fetch";
import { showAlert } from "@/components/ui/AppAlert";

// Part 4 of useHelperTask, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHelperTaskHandleIncreasePrice(setOrderId: any, setStep: any, pickupCoords: any, isPickupValid: any, description: any, setOffer: any, localOrderId: any, setLocalOrderId: any, setIsIncreasingPrice: any, setCurrentTaskPrice: any, setAssignedDriver: any, setSearchExhausted: any, calculatedFare: any) {
  const handleIncreasePrice = async (amount: number) => {
    if (!localOrderId) return;
    setIsIncreasingPrice(amount);
    // The server restarts the dispatch cascade at the new price, so this screen
    // goes back to searching instead of sitting on "no helpers available".
    setSearchExhausted(false);
    try {
      const updatedOrder = await customFetch<any>(`/orders/${localOrderId}/increase-price`, {
        method: "PATCH",
        body: JSON.stringify({ amount }),
      });
      if (updatedOrder?.customerPrice) setCurrentTaskPrice(updatedOrder.customerPrice);
      else if (updatedOrder?.totalPrice) setCurrentTaskPrice(updatedOrder.totalPrice);
    } catch {
      showAlert("Error", "Failed to increase task price.");
    } finally {
      setIsIncreasingPrice(null);
    }
  };

  const handleCancel = () => {
    showAlert("Cancel this task?", "This can't be undone.", [
      { text: "Keep task", style: "cancel" },
      {
        text: "Cancel task",
        style: "destructive",
        onPress: async () => {
          if (localOrderId) {
            try {
              await customFetch(`/orders/${localOrderId}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
            } catch (error) {
              console.warn("Failed to cancel order on backend", error);
            }
          }
          setStep("compose");
          setSearchExhausted(false);
          setAssignedDriver(null);
          setOrderId(null);
          setLocalOrderId(null);
        },
      },
    ]);
  };

  const goToBidding = () => {
    if (!isPickupValid || !pickupCoords?.lat) {
      showAlert("Missing details", "Please select a valid pickup location.");
      return;
    }
    if (!description.trim()) {
      showAlert("Missing details", "Please provide a brief description of the work.");
      return;
    }
    setOffer((prev: any) => prev ?? calculatedFare);
    setStep("bidding");
  };

  return { handleIncreasePrice, handleCancel, goToBidding };
}
