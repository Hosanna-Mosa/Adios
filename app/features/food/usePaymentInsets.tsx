import React, { useEffect, useMemo, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useCartStore } from "@/contexts/cartStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { VendorDetails, createStyles } from "./usePayment.shared";
import { getVendor } from "@/services/catalog.service";

// Split out of usePayment so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function usePaymentInsets() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const items = useCartStore((s) => s.items);
  const vendorId = useCartStore((s) => s.vendorId);
  const clearCart = useCartStore((s) => s.clearCart);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const setOrderId = useDeliveryStore((s) => s.setOrderId);
  const setStatus = useDeliveryStore((s) => s.setStatus);
  const setServiceType = useDeliveryStore((s) => s.setServiceType);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
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
    getVendor<VendorDetails>(vendorId).then(setVendor).catch(() => {});
  }, [vendorId]);

  useFocusEffect(
    React.useCallback(() => {
      void hydrateSelectedAddress();
    }, [hydrateSelectedAddress])
  );

  return { insets, params, theme, tokens, accent, styles, items, vendorId, clearCart, getItemCount, setOrderId, setStatus, setServiceType, user, token, selectedAddress, processing, setProcessing, vendor, subtotal, deliveryFee, tip, discount, couponCode, total, vendorName, receiverContact };
}
