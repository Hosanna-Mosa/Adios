import { Alert } from "react-native";
import { router } from "expo-router";
import i18n from "@/i18n";

// Part 4 of useCart, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useCartConfirmClearCart(clearCart: any, deliveryFee: any, appliedPromo: any, displayVendorName: any, subtotal: any, discount: any, total: any) {
  const confirmClearCart = () => {
    Alert.alert(
      i18n.t("app.food.clearCart"),
      i18n.t("app.food.thisRemovesEveryItemFromVar", { value: displayVendorName }),
      [
        { text: i18n.t("actions.cancel"), style: "cancel" },
        { text: i18n.t("app.food.clearCartAction"), style: "destructive", onPress: () => clearCart() },
      ],
    );
  };

  const goToCheckout = () => {
    router.push({
      pathname: "/checkout",
      params: {
        subtotal: String(subtotal),
        deliveryFee: deliveryFee != null ? String(deliveryFee) : "",
        discount: String(discount),
        couponCode: appliedPromo?.code || "",
        total: String(total),
        vendorName: displayVendorName,
      },
    });
  };

  // Restoring this account's saved cart — showing the empty state here would
  // read as "your cart was thrown away" for the second it takes.


  return { confirmClearCart, goToCheckout };
}
