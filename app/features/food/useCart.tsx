import { useCartInsets } from "./useCartInsets";
import { useCartPart2 } from "./useCartPart2";
import { useCartComplements } from "./useCartComplements";
import { useCartConfirmClearCart } from "./useCartConfirmClearCart";

// State, data loading and handlers for app/cart.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useCart() {
  const { insets, tabBarHeight, tokens, paramVendorName, items, getTotalPrice, vendorId, updateQuantity, addItem, clearCart, storeVendorName, cartStatus, syncNotices, clearSyncNotices, serviceKey, accent, styles, fetchedVendorName, deliveryFee, menuItems, setMenuItems, recentOrders, setRecentOrders, loadingRecent, setLoadingRecent, showPromoInput, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo, isApplyingPromo, setIsApplyingPromo, promoError, setPromoError } = useCartInsets();
  const {  } = useCartPart2(items, vendorId, setMenuItems, setRecentOrders, setLoadingRecent);
  const { complements, displayVendorName, subtotal, discount, total, handleApplyPromo } = useCartComplements(paramVendorName, items, getTotalPrice, vendorId, storeVendorName, fetchedVendorName, deliveryFee, menuItems, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo, setIsApplyingPromo, setPromoError);
  const { confirmClearCart, goToCheckout } = useCartConfirmClearCart(clearCart, deliveryFee, appliedPromo, displayVendorName, subtotal, discount, total);

  return {
  insets, tabBarHeight, tokens, items, vendorId, updateQuantity, addItem, cartStatus, syncNotices,
  clearSyncNotices, serviceKey, accent, styles, deliveryFee, recentOrders, loadingRecent,
  showPromoInput, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo,
  isApplyingPromo, promoError, complements, displayVendorName, subtotal, discount, total,
  handleApplyPromo, confirmClearCart, goToCheckout
  };
}

