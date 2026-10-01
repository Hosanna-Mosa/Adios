import { router } from "expo-router";
import { describePaymentError, payOnlineAndPlaceOrder } from "@/utils/razorpay";
import i18n from "@/i18n";
import { createOrder } from "@/services/orders.service";
import { getPaymentMethod } from "@/contexts/paymentMethodStore";
import { showAlert } from "@/components/ui/AppAlert";

// Handlers lifted out of useFoodCheckoutPlaceOrder: factories over the values they closed
// over, rebuilt every render exactly as the inline versions were.

export const buildPlaceOrder = (params: any, theme: any, getItemCount: any, vendorId: any, items: any, clearCart: any, user: any, token: any, setOrderId: any, setStatus: any, setServiceType: any, selectedAddress: any, setIsPlacingOrder: any, appliedPromo: any, vendorName: any, scheduledFor: any, setShowScheduleSheet: any, subtotal: any, deliveryFee: any, activeTip: any, discount: any, total: any, receiverName: any, receiverPhone: any, addressIssue: any) =>
  async () => {
    if (getItemCount() === 0) {
      showAlert(i18n.t("app.food.cartIsEmpty"), i18n.t("app.food.pleaseAddAtLeastOneItem"));
      return;
    }
    if (!user || !token) {
      showAlert(i18n.t("app.food.loginRequired"), i18n.t("app.food.pleaseLogInBeforePlacingYour"));
      router.push("/login");
      return;
    }
    if (addressIssue || !selectedAddress) {
      showAlert(i18n.t("app.food.deliveryDetailsNeeded"), addressIssue || i18n.t("app.food.selectADeliveryAddress"));
      router.push("/delivery/saved-addresses");
      return;
    }
    if (!vendorId) {
      showAlert(i18n.t("app.food.restaurantMissing"), i18n.t("app.food.pleaseChooseARestaurantAgain"));
      return;
    }
    // The slot can lapse between picking it and paying; the server rejects a
    // past scheduledFor, so catch it before anything is charged.
    if (scheduledFor && scheduledFor.getTime() <= Date.now()) {
      showAlert(i18n.t("app.food.invalidTime"), i18n.t("app.food.pleaseChooseAFutureDeliveryTime"));
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
            address: vendorName || i18n.t("app.food.orderFallback.restaurantPickup"),
            storeName: vendorName || i18n.t("app.food.orderFallback.restaurant"),
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

      // Online: Razorpay first, and the server places the order once the money is confirmed.
      // Cash: the order is placed straight away and the driver collects on delivery.
      const placedOrder: any =
        getPaymentMethod("food") === "online"
          ? await payOnlineAndPlaceOrder(total, orderDataPayload)
          : await createOrder({ ...orderDataPayload, paymentMethod: "cash" });
      const finalOrderId: string = placedOrder._id || placedOrder.id;

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
      const described = describePaymentError(error);
      showAlert(described?.title ?? i18n.t("app.food.orderFailed"), described?.message ?? (error?.message || i18n.t("app.food.unableToPlaceYourOrder")));
    } finally {
      setIsPlacingOrder(false);
    }
  };
