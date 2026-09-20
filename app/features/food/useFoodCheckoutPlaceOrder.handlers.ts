import { router } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { showAlert } from "@/components/ui/AppAlert";

// Handlers lifted out of useFoodCheckoutPlaceOrder: factories over the values they closed
// over, rebuilt every render exactly as the inline versions were.

export const buildPlaceOrder = (params: any, theme: any, getItemCount: any, vendorId: any, items: any, clearCart: any, user: any, token: any, setOrderId: any, setStatus: any, setServiceType: any, selectedAddress: any, setIsPlacingOrder: any, appliedPromo: any, vendorName: any, scheduledFor: any, setShowScheduleSheet: any, subtotal: any, deliveryFee: any, activeTip: any, discount: any, total: any, receiverName: any, receiverPhone: any, addressIssue: any) =>
  async () => {
    if (getItemCount() === 0) {
      showAlert("Cart is empty", "Please add at least one item.");
      return;
    }
    if (!user || !token) {
      showAlert("Login required", "Please log in before placing your order.");
      router.push("/login");
      return;
    }
    if (addressIssue || !selectedAddress) {
      showAlert("Delivery details needed", addressIssue || "Select a delivery address to continue.");
      router.push("/delivery/saved-addresses");
      return;
    }
    if (!vendorId) {
      showAlert("Restaurant missing", "Please choose a restaurant again.");
      return;
    }
    // The slot can lapse between picking it and paying; the server rejects a
    // past scheduledFor, so catch it before anything is charged.
    if (scheduledFor && scheduledFor.getTime() <= Date.now()) {
      showAlert("Invalid time", "Please choose a future delivery time.");
      setShowScheduleSheet(true);
      return;
    }

    const deliveryAddressObj = {
      label: selectedAddress.label || "",
      addressLine: selectedAddress.addressLine,
      phone: receiverPhone,
      receiverName: selectedAddress.receiverName || "",
      receiverPhone,
      landmark: selectedAddress.landmark || "",
      formattedAddress: selectedAddress.addressLine,
    };
    const dropLat = Number(selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1] ?? 17.0005);
    const dropLng = Number(selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0] ?? 81.804);

    setIsPlacingOrder(true);
    try {
      const orderItems = items.map((item: any) => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        // Kept so "order again" can rebuild the cart with thumbnails.
        image: item.images?.[0],
        isVeg: item.isVeg,
        category: item.category,
      }));

      const orderDataPayload = {
        serviceType: "delivery",
        vendorId,
        // `discount`/`total` are only a preview — the server re-derives both from
        // `couponCode`, so the code is the number that actually counts.
        totals: {
          subtotal,
          deliveryFee: deliveryFee || 0,
          tip: activeTip,
          discount,
          total,
          couponCode: appliedPromo?.code || undefined,
        },
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : undefined,
        scheduledDelivery: scheduledFor
          ? { type: "later", requestedAt: scheduledFor.toISOString() }
          : { type: "now" },
        stops: [
          {
            id: "vendor-pickup",
            address: vendorName || "Restaurant pickup",
            storeName: vendorName || "Restaurant",
            latitude: dropLat + 0.004,
            longitude: dropLng + 0.004,
            type: "pickup",
            items: [],
          },
          {
            id: "customer-drop",
            address: deliveryAddressObj.formattedAddress,
            deliveryAddress: deliveryAddressObj,
            latitude: dropLat,
            longitude: dropLng,
            type: "drop",
            items: orderItems,
          },
        ],
      };

      // Cash on delivery: the order is created directly rather than going
      // through create-order → gateway → verify (see usePaymentHandlePayment,
      // the sibling checkout flow this one was never brought in line with —
      // there is no gateway to open, so the old route failed every order with
      // "HTTP 400: Payment verification failed" the moment Razorpay was asked
      // to verify a payment that was never actually taken).
      const finalOrder = await customFetch<any>("/orders", {
        method: "POST",
        body: JSON.stringify(orderDataPayload),
      });

      const finalOrderId: string = finalOrder._id || finalOrder.id;

      setOrderId(finalOrderId);
      setServiceType("delivery");
      setStatus("pending");
      clearCart();

      if (scheduledFor) {
        // No driver is dispatched for a slot hours away, so finding-driver would
        // spin forever — the order waits under Scheduled in My orders instead.
        router.replace("/(tabs)/orders");
        return;
      }
      router.replace({ pathname: "/finding-driver", params: { orderId: finalOrderId } });
    } catch (error: any) {
      console.error("Place order failed", error);
      showAlert("Order failed", error?.message || "Unable to place your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };
