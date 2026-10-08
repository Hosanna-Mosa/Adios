import i18n from "@/i18n";
import { showAlert } from "@/components/ui/AppAlert";
import { createOrder } from "@/services/orders.service";
import { getPaymentMethod } from "@/contexts/paymentMethodStore";
import { describePaymentError, payOnlineAndPlaceOrder } from "@/utils/razorpay";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHelperTaskCreateTask(driver: any, setOrderId: any, setDriver: any, setServiceType: any, setStatus: any, setStep: any, pickupLocation: any, dropoffLocation: any, pickupCoords: any, dropoffCoords: any, isPickupValid: any, isDropoffValid: any, description: any, offer: any, setIsCreating: any, setLocalOrderId: any, setCurrentTaskPrice: any, assignedDriver: any, setAssignedDriver: any, setSearchExhausted: any, setSearchStartedAt: any, totalHours: any, calculatedFare: any) {
  const createTask = async () => {
    const finalOffer = offer ?? calculatedFare;
    const isOnline = getPaymentMethod("helper") === "online";
    setIsCreating(true);
    setSearchExhausted(false);
    // Online: Razorpay opens first, so the search screen only appears once the task is paid.
    if (!isOnline) {
      setSearchStartedAt(Date.now());
      setStep("searching");
    }
    setCurrentTaskPrice(finalOffer);
    try {
      const stops: any[] = [
        { sequence: 1, type: "pickup", address: pickupLocation, lat: pickupCoords?.lat, lng: pickupCoords?.lng, instructions: description },
      ];
      if (isDropoffValid && dropoffCoords?.lat) {
        stops.push({ sequence: 2, type: "drop", address: dropoffLocation, lat: dropoffCoords?.lat, lng: dropoffCoords?.lng });
      }
      const orderBody = { serviceType: "helper", stops, duration: totalHours, totals: { total: finalOffer } };
      const order = isOnline
        ? await payOnlineAndPlaceOrder<{ _id: string; customerPrice?: number; totalPrice?: number }>(finalOffer, orderBody)
        : await createOrder<{ _id: string; customerPrice?: number; totalPrice?: number }>({ ...orderBody, paymentMethod: "cash" });
      if (isOnline) {
        setSearchStartedAt(Date.now());
        setStep("searching");
      }
      if (!order?._id) throw new Error("Invalid response from server. No order ID returned.");
      setOrderId(order._id);
      setLocalOrderId(order._id);
      setServiceType("helper");
      // A stale "delivered"/"cancelled" left over from a previous trip would
      // otherwise make this brand-new task invisible to the active-order stripe
      // on the tab bar the moment it's created.
      setStatus("pending");
      setCurrentTaskPrice(order.customerPrice || order.totalPrice || finalOffer);
      // The searching step owns the status poll from here on (see
      // useHelperTaskSuggestedLow), so it is torn down with the screen.
    } catch (error: any) {
      const described = describePaymentError(error);
      showAlert(described?.title ?? i18n.t("actions.error"), described?.message ?? (error.message || i18n.t("app.delivery.failedToCreateTask")));
      setStep("bidding");
    } finally {
      setIsCreating(false);
    }
  };

  const isProceedDisabled = !isPickupValid || description.trim().length === 0;
  const activeDriver = assignedDriver || driver;

  return { createTask, isProceedDisabled, activeDriver };
}
