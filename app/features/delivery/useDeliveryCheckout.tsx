import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useAuthStore } from "@/contexts/authStore";
import { describePaymentError, payOnlineAndPlaceOrder } from "@/utils/razorpay";
import { createOrder } from "@/services/orders.service";
import { getPaymentMethod } from "@/contexts/paymentMethodStore";
import { showAlert } from "@/components/ui/AppAlert";

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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [isProcessing, setIsProcessing] = useState(false);
  const stops = useDeliveryStore((s) => s.stops);
  const price = useDeliveryStore((s) => s.price);
  const route = useDeliveryStore((s) => s.route);
  const setStatus = useDeliveryStore((s) => s.setStatus);
  const setOrderId = useDeliveryStore((s) => s.setOrderId);
  const setServiceType = useDeliveryStore((s) => s.setServiceType);
  const vendorId = useDeliveryStore((s) => s.vendorId);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const itemsEstimate = useMemo(
    () => stops.reduce((sum, s) => sum + (s.items || []).reduce((iSum, i) => iSum + (i.estimatedPrice || 0) * i.quantity, 0), 0),
    [stops]
  );
  const deliveryFee = price ? Math.round((price.baseFee + price.distanceCost) * 100) / 100 : 0;
  const stopCharges = price?.stopCharges ?? 0;

  const handleConfirm = async () => {
    if (!user || !token) {
      showAlert(t("app.delivery.loginRequired"), t("app.delivery.pleaseLogInToConfirmYour"));
      return;
    }
    if (!price || stops.length === 0) return;

    setIsProcessing(true);
    try {
      // Online: the server stores this with the payment and places the order once Razorpay
      // confirms the money. Cash: it goes to /orders directly and the driver collects.
      const orderData = {
        serviceType: "delivery",
        stops: stops.map((s) => ({ ...s, items: s.items || [] })),
        totalDistance: route?.totalDistance,
        totalPrice: price.total,
        ...(vendorId ? { vendorId } : {}),
      };
      const finalOrder: any =
        getPaymentMethod("delivery") === "online"
          ? await payOnlineAndPlaceOrder(price.total, orderData)
          : await createOrder({ ...orderData, paymentMethod: "cash" });

      setOrderId(finalOrder._id || finalOrder.id);
      setServiceType("delivery");
      setStatus("confirmed");
      router.push("/tracking");
    } catch (error: any) {
      console.error("Delivery checkout failed:", error);
      const described = describePaymentError(error);
      showAlert(described?.title ?? t("app.delivery.orderFailed"), described?.message ?? (error?.message || t("app.delivery.unableToProcessYourOrder")));
    } finally {
      setIsProcessing(false);
    }
  };


  return {
  insets, tokens, accent, styles, isProcessing, stops, price, route, itemsEstimate, deliveryFee,
  stopCharges, handleConfirm
  };
}

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type DeliveryCheckoutStyles = ReturnType<typeof createStyles>;
