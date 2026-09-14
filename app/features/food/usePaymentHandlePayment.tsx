import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { RazorpayIntegration } from "@/utils/razorpay";

// Part 2 of usePayment, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function usePaymentHandlePayment(params: any, theme: any, items: any, vendorId: any, clearCart: any, setOrderId: any, setStatus: any, setServiceType: any, user: any, token: any, selectedAddress: any, setProcessing: any, vendor: any, subtotal: any, deliveryFee: any, tip: any, discount: any, couponCode: any, total: any, vendorName: any) {
  const { t } = useTranslation();
  const handlePayment = async () => {
    if (!user || !token) {
      Alert.alert(t("app.food.loginRequired"), t("app.food.pleaseLogInBeforePlacingYour"));
      return;
    }
    if (!vendorId || items.length === 0) {
      Alert.alert(t("app.food.cartIsEmpty"), t("app.food.pleaseAddItemsBeforePaying"));
      return;
    }
    if (!selectedAddress?.addressLine) {
      Alert.alert(t("app.food.addressRequired"), t("app.food.pleaseSelectADeliveryAddress"));
      router.push("/delivery/saved-addresses");
      return;
    }

    setProcessing(true);
    try {
      const rzpOrderResponse = await customFetch<any>("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: total }),
      });

      const paymentResult = await RazorpayIntegration.open({
        order_id: rzpOrderResponse.id,
        key: rzpOrderResponse.key,
        amount: rzpOrderResponse.amount,
        currency: rzpOrderResponse.currency,
        name: rzpOrderResponse.name,
        prefill: { email: user?.email || rzpOrderResponse.prefill?.email, contact: user?.phone || "" },
        theme: rzpOrderResponse.theme,
      });

      const dropLat = Number(selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1] ?? 17.0005);
      const dropLng = Number(selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0] ?? 81.804);
      const vendorCoords = vendor?.location?.coordinates;
      const pickupLat = Number(vendorCoords?.[1] ?? dropLat + 0.004);
      const pickupLng = Number(vendorCoords?.[0] ?? dropLng + 0.004);
      const orderItems = items.map((item: any) => ({ id: item._id, name: item.name, quantity: item.quantity, price: item.price, total: item.price * item.quantity }));

      const verifyResponse = await customFetch<any>("/payments/verify", {
        method: "POST",
        body: JSON.stringify({
          ...paymentResult,
          orderData: {
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
          },
        }),
      });

      const finalOrder = verifyResponse.order;
      setOrderId(finalOrder._id || finalOrder.id);
      setServiceType("delivery");
      setStatus("confirmed");
      clearCart();
      router.replace({ pathname: "/finding-driver", params: { orderId: finalOrder._id || finalOrder.id } });
    } catch (error: any) {
      console.error("Payment failed", error);
      Alert.alert(t("app.food.paymentFailed"), error?.message || t("app.ride.pleaseTryAgain"));
    } finally {
      setProcessing(false);
    }
  };

  return { handlePayment };
}
