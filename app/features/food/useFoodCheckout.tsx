import { useFoodCheckoutInsets } from "./useFoodCheckoutInsets";
import { useFoodCheckoutActiveTip } from "./useFoodCheckoutActiveTip";
import { useFoodCheckoutRemoveCode } from "./useFoodCheckoutRemoveCode";
import { useFoodCheckoutPlaceOrder } from "./useFoodCheckoutPlaceOrder";

// State, data loading and handlers for app/checkout.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useFoodCheckout() {
  const { insets, params, theme, tokens, accent, styles, getItemCount, vendorId, items, clearCart, user, token, setOrderId, setStatus, setServiceType, selectedAddress, hydrateSelectedAddress, isPlacingOrder, setIsPlacingOrder, showPromoInput, setShowPromoInput, promoCodeText, setPromoCodeText, appliedPromo, setAppliedPromo, isApplyingPromo, setIsApplyingPromo, applyingCode, setApplyingCode, promoError, setPromoError, offers, setOffers, vendorName, tipAmount, setTipAmount, isOtherTip, setIsOtherTip, otherTipText, setOtherTipText, scheduledFor, setScheduledFor, showScheduleSheet, setShowScheduleSheet, subtotal, deliveryFee } = useFoodCheckoutInsets();
  const { activeTip, discount, total, receiverName, receiverPhone, addressIssue, applyCode } = useFoodCheckoutActiveTip(vendorId, selectedAddress, setShowPromoInput, setPromoCodeText, appliedPromo, setAppliedPromo, setIsApplyingPromo, setApplyingCode, setPromoError, tipAmount, isOtherTip, otherTipText, subtotal, deliveryFee);
  const { removeCode } = useFoodCheckoutRemoveCode(vendorId, hydrateSelectedAddress, appliedPromo, setAppliedPromo, setPromoError, setOffers, subtotal);
  const { placeOrder } = useFoodCheckoutPlaceOrder(params, theme, getItemCount, vendorId, items, clearCart, user, token, setOrderId, setStatus, setServiceType, selectedAddress, setIsPlacingOrder, appliedPromo, vendorName, scheduledFor, setShowScheduleSheet, subtotal, deliveryFee, activeTip, discount, total, receiverName, receiverPhone, addressIssue);

  return {
  insets, tokens, accent, styles, getItemCount, items, selectedAddress, isPlacingOrder,
  showPromoInput, setShowPromoInput, promoCodeText, setPromoCodeText, appliedPromo,
  isApplyingPromo, applyingCode, promoError, offers, tipAmount, setTipAmount, isOtherTip,
  setIsOtherTip, otherTipText, setOtherTipText, scheduledFor, setScheduledFor, showScheduleSheet,
  setShowScheduleSheet, subtotal, deliveryFee, activeTip, total, receiverName, receiverPhone,
  addressIssue, applyCode, removeCode, placeOrder
  };
}

