import { Alert } from "react-native";
import { router } from "expo-router";

// Split out of useCart so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useCartConfirmClearCart(clearCart: any, deliveryFee: any, appliedPromo: any, displayVendorName: any, subtotal: any, discount: any, total: any) {
  const confirmClearCart = () => {
    Alert.alert("Clear cart?", `This removes every item from ${displayVendorName}.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear cart", style: "destructive", onPress: () => clearCart() },
    ]);
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
