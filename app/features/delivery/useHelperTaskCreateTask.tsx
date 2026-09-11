import { Alert } from "react-native";
import { customFetch } from "@/utils/api/custom-fetch";
import { socketService } from "@/utils/socketService";

// Part 5 of useHelperTask, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHelperTaskCreateTask(driver: any, setOrderId: any, setDriver: any, setServiceType: any, setStep: any, pickupLocation: any, dropoffLocation: any, pickupCoords: any, dropoffCoords: any, isPickupValid: any, isDropoffValid: any, description: any, offer: any, setIsCreating: any, setLocalOrderId: any, setCurrentTaskPrice: any, assignedDriver: any, setAssignedDriver: any, totalHours: any, calculatedFare: any) {
  const createTask = async () => {
    const finalOffer = offer ?? calculatedFare;
    setIsCreating(true);
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
      setCurrentTaskPrice(order.customerPrice || order.totalPrice || finalOffer);
      socketService.trackOrder(order._id);

      const handleOrderAccepted = (data: any) => {
        if (data.driver) { setDriver(data.driver); setAssignedDriver(data.driver); }
        setServiceType("helper");
        if (data.orderId || order._id) { setOrderId(data.orderId || order._id); setLocalOrderId(data.orderId || order._id); }
        socketService.off("order_accepted", handleOrderAccepted);
        socketService.off("order_status_update", handleOrderStatus);
        setStep("assigned");
      };
      const handleOrderStatus = (data: any) => {
        if (["DRIVER_ASSIGNED", "driver_assigned", "accepted"].includes(data.status)) handleOrderAccepted(data);
      };
      socketService.on("order_accepted", handleOrderAccepted);
      socketService.on("order_status_update", handleOrderStatus);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create task");
      setStep("bidding");
    } finally {
      setIsCreating(false);
    }
  };

  const isProceedDisabled = !isPickupValid || description.trim().length === 0;
  const activeDriver = assignedDriver || driver;

  return { createTask, isProceedDisabled, activeDriver };
}
