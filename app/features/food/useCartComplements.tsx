import { useEffect, useMemo } from "react";
import { customFetch } from "@/utils/api/custom-fetch";

// Part 3 of useCart, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useCartComplements(paramVendorName: any, items: any, getTotalPrice: any, vendorId: any, storeVendorName: any, fetchedVendorName: any, deliveryFee: any, menuItems: any, setShowPromoInput: any, promoCode: any, setPromoCode: any, appliedPromo: any, setAppliedPromo: any, setIsApplyingPromo: any, setPromoError: any) {
  const complements = useMemo(
    () => menuItems.filter((m: any) => !items.some((c: any) => c._id === m._id)),
    [menuItems, items]
  );

  const displayVendorName = paramVendorName
    ? String(paramVendorName)
    : storeVendorName || fetchedVendorName || "your vendor";
  const subtotal = getTotalPrice();

  // The server owns the coupon maths — this is only what it told us.
  const discount = appliedPromo?.discountAmount || 0;
  const total = Math.max(0, Math.round((subtotal + (deliveryFee || 0) - discount) * 100) / 100);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const response = await customFetch<{ valid: boolean; code: string; discountAmount: number }>(
        "/coupons/validate",
        {
          method: "POST",
          body: JSON.stringify({ code: promoCode.trim().toUpperCase(), vendorId, subtotal }),
        }
      );
      if (response?.code) {
        setAppliedPromo({ code: response.code, discountAmount: Number(response.discountAmount) || 0 });
        setShowPromoInput(false);
        setPromoCode("");
      }
    } catch (error: any) {
      setPromoError((error?.message || "Invalid promo code").replace(/^HTTP \d+.*?: /, "").trim());
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Quantities change after a code is applied, so the saving has to be re-derived
  // server-side rather than left showing a number the order would be rejected for.
  useEffect(() => {
    const code = appliedPromo?.code;
    if (!code) return;
    let cancelled = false;
    customFetch<{ code: string; discountAmount: number }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, vendorId, subtotal }),
    })
      .then((res) => {
        if (cancelled || !res?.code) return;
        setAppliedPromo({ code: res.code, discountAmount: Number(res.discountAmount) || 0 });
      })
      .catch((error: any) => {
        if (cancelled) return;
        setAppliedPromo(null);
        setPromoError((error?.message || "This promo code no longer applies").replace(/^HTTP \d+.*?: /, "").trim());
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  return { complements, displayVendorName, subtotal, discount, total, handleApplyPromo };
}
