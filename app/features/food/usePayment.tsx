import { usePaymentInsets } from "./usePaymentInsets";
import { usePaymentHandlePayment } from "./usePaymentHandlePayment";

// State, data loading and handlers for app/payment.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function usePayment() {
  const { insets, params, theme, tokens, accent, styles, items, vendorId, clearCart, getItemCount, setOrderId, setStatus, setServiceType, user, token, selectedAddress, processing, setProcessing, vendor, subtotal, deliveryFee, tip, discount, couponCode, total, vendorName, receiverContact } = usePaymentInsets();
  const { handlePayment } = usePaymentHandlePayment(params, theme, items, vendorId, clearCart, setOrderId, setStatus, setServiceType, user, token, selectedAddress, setProcessing, vendor, subtotal, deliveryFee, tip, discount, couponCode, total, vendorName);

  return {
  insets, tokens, accent, styles, items, getItemCount, selectedAddress, processing, subtotal,
  deliveryFee, tip, discount, couponCode, total, vendorName, receiverContact, handlePayment
  };
}

