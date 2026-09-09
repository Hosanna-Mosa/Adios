import { useMemo, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useAuthStore } from "@/contexts/authStore";
import { RazorpayIntegration } from "@/utils/razorpay";
import { customFetch } from "@/utils/api/custom-fetch";

// State, data loading and handlers for app/delivery/checkout.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["delivery"]) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 10 },
    iconBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    headerSub: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },

    section: { paddingHorizontal: 16, paddingTop: 18 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },

    emptyStops: { alignItems: "center", gap: 8, paddingVertical: 20 },
    emptyStopsText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.muted },

    routeCard: { flexDirection: "row", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 14 },
    routeRail: { width: 18, alignItems: "center", paddingTop: 6, gap: 4 },
    pickupDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2.5, borderColor: accent.accent },
    railLine: { width: 2, flex: 1, minHeight: 18, backgroundColor: tokens.borderStrong },
    stopNumber: { width: 18, height: 18, borderRadius: 9, backgroundColor: accent.accent, alignItems: "center", justifyContent: "center" },
    stopNumberText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: accent.on },
    dropSquare: { width: 10, height: 10, borderRadius: 2, backgroundColor: tokens.text },
    routeStartEnd: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    stopName: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    stopMeta: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },

    storePaymentCard: { backgroundColor: tokens.warningSkin, borderRadius: 16, padding: 14 },
    storePaymentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    storePaymentLabel: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    storePaymentValue: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    storePaymentNote: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec },

    billCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 16, gap: 11 },
    billRow: { flexDirection: "row", justifyContent: "space-between" },
    billLabel: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec },
    billValue: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    billDivider: { borderTopWidth: 1, borderTopColor: tokens.borderStrong, borderStyle: "dashed", marginTop: 3, paddingTop: 1 },
    billTotalLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    billTotalValue: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.3, color: tokens.text },

    methodRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 13, minHeight: 60 },
    methodIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    methodTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    methodSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec, marginTop: 2 },

    footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface },
    trustRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 10 },
    trustText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
    payBtn: {
      backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    payBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    payBtnPrice: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on, opacity: 0.85 },
  });

export function useDeliveryCheckout() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [isProcessing, setIsProcessing] = useState(false);
  const { stops, price, route, setStatus, setOrderId, setServiceType, vendorId } = useDeliveryStore();
  const { user, token } = useAuthStore();

  const itemsEstimate = useMemo(
    () => stops.reduce((sum, s) => sum + (s.items || []).reduce((iSum, i) => iSum + (i.estimatedPrice || 0) * i.quantity, 0), 0),
    [stops]
  );
  const deliveryFee = price ? Math.round((price.baseFee + price.distanceCost) * 100) / 100 : 0;
  const stopCharges = price?.stopCharges ?? 0;

  const handleConfirm = async () => {
    if (!user || !token) {
      Alert.alert("Login required", "Please log in to confirm your order.");
      return;
    }
    if (!price || stops.length === 0) return;

    setIsProcessing(true);
    try {
      const rzpOrder = await customFetch<any>("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: price.total }),
      });

      const paymentResult = await RazorpayIntegration.open({
        key: rzpOrder.key,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: rzpOrder.name,
        order_id: rzpOrder.id,
        prefill: { email: user?.email || rzpOrder.prefill?.email, contact: user?.phone || "" },
        theme: rzpOrder.theme,
      });

      const verifyResponse = await customFetch<any>("/payments/verify", {
        method: "POST",
        body: JSON.stringify({
          ...paymentResult,
          orderData: {
            stops: stops.map((s) => ({ ...s, items: s.items || [] })),
            totalDistance: route?.totalDistance,
            totalPrice: price.total,
            vendorId,
          },
        }),
      });

      const finalOrder = verifyResponse.order;
      setOrderId(finalOrder._id || finalOrder.id);
      setServiceType("delivery");
      setStatus("confirmed");
      router.push("/tracking");
    } catch (error: any) {
      console.error("Delivery checkout failed:", error);
      Alert.alert("Order failed", error?.message || "Unable to process your order.");
    } finally {
      setIsProcessing(false);
    }
  };


  return {
  insets, tokens, accent, styles, isProcessing, stops, price, route, itemsEstimate, deliveryFee,
  stopCharges, handleConfirm
  };
}
