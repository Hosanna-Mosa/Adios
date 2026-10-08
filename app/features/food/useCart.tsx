import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useCartInsets } from "./useCartInsets";
import { useCartStore } from "@/contexts/cartStore";
import { useCartMenuAndRecentOrders } from "./useCartMenuAndRecentOrders";
import { useCartComplements } from "./useCartComplements";
import { useCartConfirmClearCart } from "./useCartConfirmClearCart";
import { showOutletClosedAlert } from "@/components/shared/outletClosed";
import { useOutletOrderingState } from "./useOutletOrderingState";

// State, data loading and handlers for app/cart.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useCart() {
  const { insets, tabBarHeight, tokens, paramVendorName, items, getTotalPrice, vendorId, updateQuantity, addItem, clearCart, storeVendorName, cartStatus, syncNotices, clearSyncNotices, serviceKey, accent, styles, fetchedVendorName, deliveryFee, menuItems, setMenuItems, recentOrders, setRecentOrders, loadingRecent, setLoadingRecent, showPromoInput, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo, isApplyingPromo, setIsApplyingPromo, promoError, setPromoError } = useCartInsets();
  const {  } = useCartMenuAndRecentOrders(items, vendorId, setMenuItems, setRecentOrders, setLoadingRecent);
  const { complements, displayVendorName, subtotal, discount, total, handleApplyPromo } = useCartComplements(paramVendorName, items, getTotalPrice, vendorId, storeVendorName, fetchedVendorName, deliveryFee, menuItems, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo, setIsApplyingPromo, setPromoError);
  // Each time the cart opens, re-check it against the live menu: a dish the
  // restaurant deleted (or sold out) since it was added drops out, with a notice.
  useFocusEffect(
    useCallback(() => {
      void useCartStore.getState().refresh();
    }, []),
  );

  const { confirmClearCart, goToCheckout: openCheckout } = useCartConfirmClearCart(clearCart, deliveryFee, appliedPromo, displayVendorName, subtotal, discount, total);
  const { orderingState, isClosed: outletClosed, refresh: refreshOrderingState } = useOutletOrderingState(vendorId);

  // A closed outlet takes nothing new: the "+" on a line and the "complement
  // your cart" adds are refused like the menu's. Lowering or removing still works.
  const refuseIfClosed = () => {
    if (!outletClosed) return false;
    showOutletClosedAlert(orderingState, displayVendorName);
    refreshOrderingState();
    return true;
  };
  const guardedUpdateQuantity = (itemId: string, quantity: number) => {
    const line = items.find((i) => i._id === itemId);
    if (line && quantity > line.quantity && refuseIfClosed()) return;
    updateQuantity(itemId, quantity);
  };
  const guardedAddItem: typeof addItem = (item, itemVendorId, vendorName) => {
    if (refuseIfClosed()) return;
    addItem(item, itemVendorId, vendorName);
  };

  // The outlet may have stopped taking orders since these items were added.
  // If the check itself fails, carry on — the server refuses the order anyway.
  const goToCheckout = async () => {
    const state = vendorId ? await refreshOrderingState() : null;
    if (state && !state.isOpen) {
      showOutletClosedAlert(state, displayVendorName);
      return;
    }
    openCheckout();
  };

  return {
  insets, tabBarHeight, tokens, items, vendorId, updateQuantity: guardedUpdateQuantity, addItem: guardedAddItem, cartStatus, syncNotices,
  clearSyncNotices, serviceKey, accent, styles, deliveryFee, recentOrders, loadingRecent,
  showPromoInput, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo,
  isApplyingPromo, promoError, complements, displayVendorName, subtotal, discount, total,
  handleApplyPromo, confirmClearCart, goToCheckout
  };
}

