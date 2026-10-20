import { router } from "expo-router";
import i18n from "@/i18n";
import { getVendor } from "@/services/catalog.service";
import { showAlert } from "@/components/ui/AppAlert";
import { useFoodPaymentStore } from "./foodPaymentStore";

// Handlers lifted out of useFoodCheckoutPlaceOrder: factories over the values they closed
// over, rebuilt every render exactly as the inline versions were.
//
// Checkout's "Proceed to pay": checks the cart, address and slot, builds the order and hands
// it to the payment screen (app/payment.tsx), where the customer picks cash or Razorpay.

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
    // The address's own pin — never a made-up point. One saved without coordinates
    // has to be re-picked on the map before anything can be delivered to it.
    const dropLat = Number(selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1]);
    const dropLng = Number(selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0]);
    if (!Number.isFinite(dropLat) || !Number.isFinite(dropLng)) {
      showAlert(i18n.t("app.food.deliveryDetailsNeeded"), i18n.t("app.food.selectADeliveryAddress"));
      router.push("/delivery/saved-addresses");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Pickup is the restaurant itself. The server pins it to the outlet's stored
      // location as well (OrdersService.pinPickupToOutlet); the delivery point only
      // stands in when the outlet's location can't be read here.
      const outlet: any = await getVendor(vendorId).catch(() => null);
      const [outletLng, outletLat] = outlet?.location?.coordinates ?? [];
      const hasOutletPoint = Number.isFinite(outletLat) && Number.isFinite(outletLng);

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
            address: outlet?.address || vendorName || i18n.t("app.food.orderFallback.restaurantPickup"),
            storeName: vendorName || i18n.t("app.food.orderFallback.restaurant"),
            latitude: hasOutletPoint ? outletLat : dropLat,
            longitude: hasOutletPoint ? outletLng : dropLng,
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

      useFoodPaymentStore.getState().setPending({
        orderData: orderDataPayload,
        total,
        itemCount: getItemCount(),
        vendorName: vendorName || i18n.t("app.food.orderFallback.restaurant"),
        addressLabel: selectedAddress.label || "",
        addressLine: selectedAddress.addressLine,
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
      });
      router.push("/payment");
    } catch (error: any) {
      console.error("Proceed to pay failed", error);
      showAlert(i18n.t("app.food.orderFailed"), error?.message || i18n.t("app.food.unableToPlaceYourOrder"));
    } finally {
      setIsPlacingOrder(false);
    }
  };
