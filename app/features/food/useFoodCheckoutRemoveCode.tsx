import React, { useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { ApplicableCoupon } from "./useFoodCheckout.shared";
import { getApplicableCoupons } from "@/services/payments.service";

// Split out of useFoodCheckout so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useFoodCheckoutRemoveCode(vendorId: any, hydrateSelectedAddress: any, appliedPromo: any, setAppliedPromo: any, setPromoError: any, setOffers: any, subtotal: any) {
  const removeCode = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  // What each live code is worth on THIS cart, straight from the server. Re-runs
  // on every subtotal change so an applied code can never show a saving the
  // order would then be rejected for.
  useEffect(() => {
    if (subtotal <= 0) return;
    let cancelled = false;
    const query = `?subtotal=${encodeURIComponent(String(subtotal))}${vendorId ? `&vendorId=${encodeURIComponent(vendorId)}` : ""}`;
    getApplicableCoupons<{ coupons: ApplicableCoupon[] }>(query)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.coupons) ? res.coupons : [];
        setOffers(list);

        const currentCode = appliedPromo?.code;
        if (!currentCode) return;
        const match = list.find((c) => c.code === currentCode);
        if (!match) return;
        if (match.isApplicable === false) {
          setPromoError(`${currentCode} needs a minimum order of ₹${match.minOrder}.`);
          setAppliedPromo(null);
          return;
        }
        setAppliedPromo({ code: currentCode, discountAmount: match.discountAmount });
      })
      .catch(() => {
        if (!cancelled) setOffers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [vendorId, subtotal, appliedPromo?.code]);

  // Re-read on focus so a selection made in the address book — or a deletion,
  // which returns checkout to the blocked state — lands as soon as we're back.
  useFocusEffect(
    React.useCallback(() => {
      void hydrateSelectedAddress();
    }, [hydrateSelectedAddress])
  );

  return { removeCode };
}
