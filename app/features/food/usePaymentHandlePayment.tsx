import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { describePaymentError, payOnlineAndPlaceOrder } from "@/utils/razorpay";
import { createOrder } from "@/services/orders.service";
import { getPaymentMethod } from "@/contexts/paymentMethodStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { foodStageOf } from "@/contexts/foodStage";
import { showAlert } from "@/components/ui/AppAlert";

// Split out of usePayment so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function usePaymentHandlePayment(params: any, theme: any, items: any, vendorId: any, clearCart: any, setOrderId: any, setStatus: any, setServiceType: any, user: any, token: any, selectedAddress: any, setProcessing: any, vendor: any, subtotal: any, deliveryFee: any, tip: any, discount: any, couponCode: any, total: any, vendorName: any) {
  const { t } = useTranslation();
  const handlePayment = async () => {
    if (!user || !token) {
      showAlert(t("app.food.loginRequired"), t("app.food.pleaseLogInBeforePlacingYour"));
      return;
    }
    if (!vendorId || items.length === 0) {
      showAlert(t("app.food.cartIsEmpty"), t("app.food.pleaseAddItemsBeforePaying"));
      return;
    }
    if (!selectedAddress?.addressLine) {
      showAlert(t("app.food.addressRequired"), t("app.food.pleaseSelectADeliveryAddress"));
      router.push("/delivery/saved-addresses");
      return;
    }

    // The address's own pin — never a made-up point.
    const dropLat = Number(selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1]);
    const dropLng = Number(selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0]);
    if (!Number.isFinite(dropLat) || !Number.isFinite(dropLng)) {
      showAlert(t("app.food.addressRequired"), t("app.food.pleaseSelectADeliveryAddress"));
      router.push("/delivery/saved-addresses");
      return;
    }

    setProcessing(true);
    try {
      // Pickup is the restaurant; the server pins it to the outlet's stored location too
      // (OrdersService.pinPickupToOutlet), so the delivery point only stands in when unknown here.
      const vendorCoords = vendor?.location?.coordinates;
      const pickupLat = Number(vendorCoords?.[1] ?? dropLat);
      const pickupLng = Number(vendorCoords?.[0] ?? dropLng);
      const orderItems = items.map((item: any) => ({ id: item._id, name: item.name, quantity: item.quantity, price: item.price, total: item.price * item.quantity }));

      // Online: this goes with the payment and the server places the order once Razorpay
      // confirms the money. Cash: it is posted to /orders directly.
      const orderData = {
        serviceType: "delivery",
        vendorId,
        // The server re-derives the discount from the code — the numbers
        // beside it are only what this screen displayed.
        totals: { subtotal, deliveryFee: deliveryFee || 0, tip, discount, total, couponCode: couponCode || undefined },
        stops: [
          {
            id: "vendor-pickup",
            address: vendor?.address || "Restaurant pickup",
            storeName: vendorName,
            latitude: pickupLat,
            longitude: pickupLng,
            type: "pickup",
            items: [],
          },
          {
            id: "customer-drop",
            address: selectedAddress.addressLine,
            deliveryAddress: {
              label: selectedAddress.label || "",
              addressLine: selectedAddress.addressLine,
              phone: selectedAddress.receiverPhone || selectedAddress.phone || "",
              receiverName: selectedAddress.receiverName || "",
              receiverPhone: selectedAddress.receiverPhone || selectedAddress.phone || "",
              landmark: selectedAddress.landmark || "",
              formattedAddress: selectedAddress.addressLine,
            },
            latitude: dropLat,
            longitude: dropLng,
            type: "drop",
            items: orderItems,
          },
        ],
      };

      const finalOrder: any =
        getPaymentMethod("food") === "online"
          ? await payOnlineAndPlaceOrder(total, orderData)
          : await createOrder({ ...orderData, paymentMethod: "cash" });
      setOrderId(finalOrder._id || finalOrder.id);
      // A restaurant order waits for the restaurant before any rider is searched for.
      useDeliveryStore.getState().setFoodStage(foodStageOf(finalOrder));
      setServiceType("delivery");
      setStatus("confirmed");
      clearCart();
      router.replace({ pathname: "/finding-driver", params: { orderId: finalOrder._id || finalOrder.id } });
    } catch (error: any) {
      console.error("Payment failed", error);
      const described = describePaymentError(error);
      showAlert(described?.title ?? t("app.food.paymentFailed"), described?.message ?? (error?.message || t("app.ride.pleaseTryAgain")));
    } finally {
      setProcessing(false);
    }
  };

  return { handlePayment };
}
