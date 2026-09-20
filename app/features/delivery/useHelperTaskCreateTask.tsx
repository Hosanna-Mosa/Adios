import { customFetch } from "@/utils/api/custom-fetch";
import { showAlert } from "@/components/ui/AppAlert";

// Part 5 of useHelperTask, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHelperTaskCreateTask(driver: any, setOrderId: any, setDriver: any, setServiceType: any, setStatus: any, setStep: any, pickupLocation: any, dropoffLocation: any, pickupCoords: any, dropoffCoords: any, isPickupValid: any, isDropoffValid: any, description: any, offer: any, setIsCreating: any, setLocalOrderId: any, setCurrentTaskPrice: any, assignedDriver: any, setAssignedDriver: any, setSearchExhausted: any, setSearchStartedAt: any, totalHours: any, calculatedFare: any) {
  const createTask = async () => {
    const finalOffer = offer ?? calculatedFare;
    setIsCreating(true);
    setSearchExhausted(false);
    setSearchStartedAt(Date.now());
    setStep("searching");
    setCurrentTaskPrice(finalOffer);
    try {
      const stops: any[] = [
        { sequence: 1, type: "pickup", address: pickupLocation, lat: pickupCoords?.lat, lng: pickupCoords?.lng, instructions: description },
      ];
      if (isDropoffValid && dropoffCoords?.lat) {
        stops.push({ sequence: 2, type: "drop", address: dropoffLocation, lat: dropoffCoords?.lat, lng: dropoffCoords?.lng });
      }
      const order = await customFetch<{ _id: string; customerPrice?: number; totalPrice?: number }>("/orders", {
        method: "POST",
        body: JSON.stringify({ serviceType: "helper", stops, duration: totalHours, totals: { total: finalOffer } }),
      });
      if (!order?._id) throw new Error("Invalid response from server. No order ID returned.");
      setOrderId(order._id);
      setLocalOrderId(order._id);
      setServiceType("helper");
      // A stale "delivered"/"cancelled" left over from a previous trip would
      // otherwise make this brand-new task invisible to the active-order stripe
      // on the tab bar the moment it's created.
      setStatus("pending");
      setCurrentTaskPrice(order.customerPrice || order.totalPrice || finalOffer);
      // The searching step owns the socket subscription and the status poll from
      // here on (see useHelperTaskSuggestedLow), so they are torn down with the
      // screen — the listeners attached here were never unsubscribed.
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to create task");
      setStep("bidding");
    } finally {
      setIsCreating(false);
    }
  };

  const isProceedDisabled = !isPickupValid || description.trim().length === 0;
  const activeDriver = assignedDriver || driver;

  return { createTask, isProceedDisabled, activeDriver };
}
