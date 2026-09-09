import React, { useEffect, useMemo, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useCartStore } from "@/contexts/cartStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { VendorDetails, createStyles } from "./usePayment.shared";

// Part 1 of usePayment, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function usePaymentInsets() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const { items, vendorId, clearCart, getItemCount } = useCartStore();
  const { setOrderId, setStatus, setServiceType } = useDeliveryStore();
  const { user, token } = useAuthStore();
  const selectedAddress = useDeliveryStore((s) => s.selectedAddress);
  const hydrateSelectedAddress = useDeliveryStore((s) => s.hydrateSelectedAddress);

  const [processing, setProcessing] = useState(false);
  const [vendor, setVendor] = useState<VendorDetails | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0) || Number(params.subtotal || 0);
  const deliveryFee = params.deliveryFee ? Number(params.deliveryFee) : null;
  const tip = Number(params.tip || 0);
  const discount = Number(params.discount || 0);
  const couponCode = params.couponCode ? String(params.couponCode) : "";
  const total = Math.max(0, Math.round((subtotal + (deliveryFee || 0) + tip - discount) * 100) / 100);
  const vendorName = params.vendorName ? String(params.vendorName) : vendor?.name || "your vendor";
  const receiverContact = [
    String(selectedAddress?.receiverName || "").trim(),
    String(selectedAddress?.receiverPhone || selectedAddress?.phone || "").trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    if (!vendorId) return;
    customFetch<VendorDetails>(`/vendors/${vendorId}`).then(setVendor).catch(() => {});
  }, [vendorId]);

  useFocusEffect(
    React.useCallback(() => {
      void hydrateSelectedAddress();
    }, [hydrateSelectedAddress])
  );

  return { insets, params, theme, tokens, accent, styles, items, vendorId, clearCart, getItemCount, setOrderId, setStatus, setServiceType, user, token, selectedAddress, processing, setProcessing, vendor, subtotal, deliveryFee, tip, discount, couponCode, total, vendorName, receiverContact };
}
