import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./checkout.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useAuthStore } from "@/contexts/authStore";
import { useServiceAccent } from "@/contexts/homeStore";
import { ApplicableCoupon } from "./useFoodCheckout.shared";

// Part 1 of useFoodCheckout, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useFoodCheckoutInsets() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  // The active Food/Meat mode owns the accent, so the mode the customer is
  // shopping in carries all the way through checkout.
  const accent = useServiceAccent();
  const styles = useMemo(() => createStyles(tokens, accent), [theme, accent]);

  const { getItemCount, vendorId, items, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const { setOrderId, setStatus, setServiceType } = useDeliveryStore();
  // The address book owns the selection; checkout just reads it back.
  const selectedAddress = useDeliveryStore((s) => s.selectedAddress);
  const hydrateSelectedAddress = useDeliveryStore((s) => s.hydrateSelectedAddress);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCodeText, setPromoCodeText] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(
    params.couponCode && Number(params.discount) > 0
      ? { code: String(params.couponCode), discountAmount: Number(params.discount) }
      : null
  );
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [offers, setOffers] = useState<ApplicableCoupon[]>([]);
  const vendorName = params.vendorName ? String(params.vendorName) : "your vendor";

  const [tipAmount, setTipAmount] = useState(0);
  const [isOtherTip, setIsOtherTip] = useState(false);
  const [otherTipText, setOtherTipText] = useState("");

  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0) || Number(params.subtotal || 0);
  const deliveryFee = params.deliveryFee ? Number(params.deliveryFee) : null;

  return { insets, params, theme, tokens, accent, styles, getItemCount, vendorId, items, clearCart, user, token, setOrderId, setStatus, setServiceType, selectedAddress, hydrateSelectedAddress, isPlacingOrder, setIsPlacingOrder, showPromoInput, setShowPromoInput, promoCodeText, setPromoCodeText, appliedPromo, setAppliedPromo, isApplyingPromo, setIsApplyingPromo, applyingCode, setApplyingCode, promoError, setPromoError, offers, setOffers, vendorName, tipAmount, setTipAmount, isOtherTip, setIsOtherTip, otherTipText, setOtherTipText, scheduledFor, setScheduledFor, showScheduleSheet, setShowScheduleSheet, subtotal, deliveryFee };
}
