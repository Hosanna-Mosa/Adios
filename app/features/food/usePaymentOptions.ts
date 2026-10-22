import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "@/i18n";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useServiceAccent } from "@/contexts/homeStore";
import { useCartStore } from "@/contexts/cartStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { foodStageOf } from "@/contexts/foodStage";
import { usePaymentMethodStore, type PaymentMethod } from "@/contexts/paymentMethodStore";
import { createOrder } from "@/services/orders.service";
import { describePaymentError, payOnlineAndPlaceOrder } from "@/utils/razorpay";
import { showAlert } from "@/components/ui/AppAlert";
import { useFoodPaymentStore } from "./foodPaymentStore";
import { createStyles } from "./paymentOptions.styles";

// State and the pay action for app/payment.tsx. Pays for the order checkout handed over
// (foodPaymentStore): cash places it now and the rider collects; online goes through Razorpay
// first and the server places the order once the money is confirmed.

export function usePaymentOptions() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  // Same accent as checkout, so a Meat order stays in the Meat colour.
  const accent = useServiceAccent();
  const styles = useMemo(() => createStyles(tokens, accent), [tokens, accent]);

  const pending = useFoodPaymentStore((s) => s.pending);
  const method = usePaymentMethodStore((s) => s.methods.food);
  const setFoodMethod = usePaymentMethodStore((s) => s.setMethod);
  const setMethod = (next: PaymentMethod) => setFoodMethod("food", next);
  const [processing, setProcessing] = useState(false);

  // Nothing handed over (e.g. the app reopened straight onto this route): go back to checkout.
  useEffect(() => {
    if (!pending && !processing) router.replace("/checkout");
  }, [pending, processing]);

  const pay = async () => {
    if (!pending || processing) return;
    // The slot can lapse while this screen is open; the server rejects a past one.
    if (pending.scheduledFor && new Date(pending.scheduledFor).getTime() <= Date.now()) {
      showAlert(i18n.t("app.food.invalidTime"), i18n.t("app.food.pleaseChooseAFutureDeliveryTime"));
      router.back();
      return;
    }

    setProcessing(true);
    try {
      const placedOrder: any =
        method === "online"
          ? await payOnlineAndPlaceOrder(pending.total, pending.orderData)
          : await createOrder({ ...pending.orderData, paymentMethod: "cash" });
      const orderId: string = placedOrder._id || placedOrder.id;

      const delivery = useDeliveryStore.getState();
      delivery.setOrderId(orderId);
      // A restaurant order waits for the restaurant before any rider is searched for.
      delivery.setFoodStage(foodStageOf(placedOrder));
      delivery.setServiceType("delivery");
      delivery.setStatus("pending");
      useCartStore.getState().clearCart();

      // Checkout sits under this screen; close it too, so Back from what comes next lands
      // where it did when checkout placed the order itself.
      router.dismiss();
      if (pending.scheduledFor) {
        // No driver is dispatched for a slot hours away, so the order waits under
        // Scheduled in My orders instead of on finding-driver.
        router.replace("/(tabs)/orders");
      } else {
        router.replace({ pathname: "/finding-driver", params: { orderId } });
      }
      useFoodPaymentStore.getState().setPending(null);
    } catch (error: any) {
      console.error("Payment failed", error);
      const described = describePaymentError(error);
      showAlert(
        described?.title ?? i18n.t("app.food.orderFailed"),
        described?.message ?? (error?.message || i18n.t("app.food.unableToPlaceYourOrder")),
      );
      setProcessing(false);
    }
  };

  return { insets, tokens, accent, styles, pending, method, setMethod, processing, pay };
}
