import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { showAlert } from "@/components/ui/AppAlert";

// Part 2 of usePayment, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function usePaymentHandlePayment(params: any, theme: any, items: any, vendorId: any, clearCart: any, setOrderId: any, setStatus: any, setServiceType: any, user: any, token: any, selectedAddress: any, setProcessing: any, vendor: any, subtotal: any, deliveryFee: any, tip: any, discount: any, couponCode: any, total: any, vendorName: any) {
  const handlePayment = async () => {
    if (!user || !token) {
      showAlert("Login required", "Please log in before placing your order.");
      return;
    }
    if (!vendorId || items.length === 0) {
      showAlert("Cart is empty", "Please add items before paying.");
      return;
    }
    if (!selectedAddress?.addressLine) {
      showAlert("Address required", "Please select a delivery address.");
      router.push("/delivery/saved-addresses");
      return;
    }

    setProcessing(true);
    try {
      const dropLat = Number(selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1] ?? 17.0005);
      const dropLng = Number(selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0] ?? 81.804);
      const vendorCoords = vendor?.location?.coordinates;
      const pickupLat = Number(vendorCoords?.[1] ?? dropLat + 0.004);
      const pickupLng = Number(vendorCoords?.[0] ?? dropLng + 0.004);
      const orderItems = items.map((item: any) => ({ id: item._id, name: item.name, quantity: item.quantity, price: item.price, total: item.price * item.quantity }));

      // Cash on delivery: the order is created directly rather than going through
      // create-order → gateway → verify. There is no gateway to open, so that route
      // left Place order with nothing to do and no way to complete a food order.
      const finalOrder = await customFetch<any>("/orders", {
        method: "POST",
        body: JSON.stringify({
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
        }),
      });

      setOrderId(finalOrder._id || finalOrder.id);
      setServiceType("delivery");
      setStatus("confirmed");
      clearCart();
      router.replace({ pathname: "/finding-driver", params: { orderId: finalOrder._id || finalOrder.id } });
    } catch (error: any) {
      console.error("Order placement failed", error);
      showAlert("Could not place order", error?.message || "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return { handlePayment };
}
