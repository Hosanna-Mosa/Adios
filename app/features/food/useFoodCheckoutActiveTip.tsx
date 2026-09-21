import { cleanApiMessage } from "./useFoodCheckout.shared";
import { validateCoupon } from "@/services/payments.service";

// Split out of useFoodCheckout so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useFoodCheckoutActiveTip(vendorId: any, selectedAddress: any, setShowPromoInput: any, setPromoCodeText: any, appliedPromo: any, setAppliedPromo: any, setIsApplyingPromo: any, setApplyingCode: any, setPromoError: any, tipAmount: any, isOtherTip: any, otherTipText: any, subtotal: any, deliveryFee: any) {
  const activeTip = isOtherTip ? Number(otherTipText) || 0 : tipAmount;
  const discount = appliedPromo?.discountAmount || 0;
  const total = Math.max(0, Math.round((subtotal + (deliveryFee || 0) + activeTip - discount) * 100) / 100);

  // Receiver contact. `receiverPhone` is the address-book field; `phone` is what
  // older saved addresses carry, and an all-zeros number is a legacy placeholder,
  // not a real contact.
  const receiverName = String(selectedAddress?.receiverName || "").trim();
  const receiverPhone = String(selectedAddress?.receiverPhone || selectedAddress?.phone || "").trim();
  const phoneDigits = receiverPhone.replace(/\D/g, "");
  const hasReceiverContact = phoneDigits.length >= 10 && !/^0+$/.test(phoneDigits);
  const addressIssue = !selectedAddress?.addressLine
    ? "Select a delivery address to continue."
    : !hasReceiverContact
      ? "Add a receiver contact number for this address to continue."
      : null;

  const applyCode = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setIsApplyingPromo(true);
    setApplyingCode(trimmed);
    setPromoError(null);
    try {
      const response = await validateCoupon<{ valid: boolean; code: string; discountAmount: number }>({ code: trimmed, vendorId, subtotal });
      if (response?.code) {
        setAppliedPromo({ code: response.code, discountAmount: Number(response.discountAmount) || 0 });
        setShowPromoInput(false);
        setPromoCodeText("");
      }
    } catch (error: any) {
      setPromoError(cleanApiMessage(error?.message, "Invalid promo code"));
    } finally {
      setIsApplyingPromo(false);
      setApplyingCode(null);
    }
  };

  return { activeTip, discount, total, receiverName, receiverPhone, addressIssue, applyCode };
}
