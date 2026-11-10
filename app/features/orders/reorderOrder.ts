import { router } from "expo-router";
import i18n from "@/i18n";
import { showAlert } from "@/components/ui/AppAlert";
import { useCartStore } from "@/contexts/cartStore";
import { useHomeStore } from "@/contexts/homeStore";
import { reorder } from "@/services/orders.service";
import { readOrderLines, toCartItem } from "./useOrders.shared";

/** Puts a past restaurant / meat order's dishes back in the cart and opens it. */
export async function reorderToCart(order: any): Promise<void> {
  const vendorId = typeof order.vendor === "object" ? order.vendor?._id : order.vendor;
  const vendorName = typeof order.vendor === "object" ? order.vendor?.name : undefined;
  let cartVendorId: string | null = vendorId || null;
  let cartItems = [] as ReturnType<typeof toCartItem>[];
  try {
    const cart = await reorder(order._id);
    cartItems = (cart?.items || []).map(toCartItem).filter((item) => !!item._id);
    cartVendorId = cart?.vendorId ?? cartVendorId;
  } catch {
    cartItems = readOrderLines(order).map(toCartItem).filter((item) => !!item._id);
  }
  if (!cartVendorId || cartItems.length === 0) {
    showAlert(i18n.t("app.orders.cantReorder"), i18n.t("app.orders.weCouldntFindTheItemsFrom"));
    return;
  }
  useCartStore.getState().replaceCart(cartVendorId, cartItems, vendorName);
  useHomeStore.getState().setActiveService(order.__serviceKey === "meat" ? "Meat" : "Food");
  router.push("/cart");
}
