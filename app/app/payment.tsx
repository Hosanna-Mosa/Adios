import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";

import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { Header } from "@/components/ui/Header";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useCartStore } from "@/contexts/cartStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { RazorpayIntegration } from "@/utils/razorpay";
import { fadeInUp } from "@/motion/presets";
import { PaymentFooter } from "@/features/food/components/PaymentFooter";
import { PaymentTrustNote } from "@/features/food/components/PaymentTrustNote";
import { PaymentMethodRow } from "@/features/food/components/PaymentMethodRow";
import { PaymentAddressCard } from "@/features/food/components/PaymentAddressCard";
import { PaymentBillCard } from "@/features/food/components/PaymentBillCard";
import { PaymentAmountHeader } from "@/features/food/components/PaymentAmountHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";

type VendorDetails = { _id: string; name: string; address: string; location?: { coordinates?: number[] } };

export default function PaymentScreen() {
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

  const handlePayment = async () => {
    if (!user || !token) {
      Alert.alert("Login required", "Please log in before placing your order.");
      return;
    }
    if (!vendorId || items.length === 0) {
      Alert.alert("Cart is empty", "Please add items before paying.");
      return;
    }
    if (!selectedAddress?.addressLine) {
      Alert.alert("Address required", "Please select a delivery address.");
      router.push("/delivery/saved-addresses");
      return;
    }

    setProcessing(true);
    try {
      const rzpOrderResponse = await customFetch<any>("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: total }),
      });

      const paymentResult = await RazorpayIntegration.open({
        order_id: rzpOrderResponse.id,
        key: rzpOrderResponse.key,
        amount: rzpOrderResponse.amount,
        currency: rzpOrderResponse.currency,
        name: rzpOrderResponse.name,
        prefill: { email: user?.email || rzpOrderResponse.prefill?.email, contact: user?.phone || "" },
        theme: rzpOrderResponse.theme,
      });

      const dropLat = Number(selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1] ?? 17.0005);
      const dropLng = Number(selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0] ?? 81.804);
      const vendorCoords = vendor?.location?.coordinates;
      const pickupLat = Number(vendorCoords?.[1] ?? dropLat + 0.004);
      const pickupLng = Number(vendorCoords?.[0] ?? dropLng + 0.004);
      const orderItems = items.map((item) => ({ id: item._id, name: item.name, quantity: item.quantity, price: item.price, total: item.price * item.quantity }));

      const verifyResponse = await customFetch<any>("/payments/verify", {
        method: "POST",
        body: JSON.stringify({
          ...paymentResult,
          orderData: {
            serviceType: "delivery",
            vendorId,
            // The server re-derives the discount from the code — the numbers
            // beside it are only what this screen displayed.
            totals: { subtotal, deliveryFee: deliveryFee || 0, tip, discount, total, couponCode: couponCode || undefined },
            stops: [
              {
                id: "vendor-pickup",
                address: vendor?.address || "Restaurant pickup",
                storeName: vendorName,
                latitude: pickupLat,
                longitude: pickupLng,
                type: "pickup",
                items: [],
              },
              {
                id: "customer-drop",
                address: selectedAddress.addressLine,
                deliveryAddress: {
                  label: selectedAddress.label || "",
                  addressLine: selectedAddress.addressLine,
                  phone: selectedAddress.receiverPhone || selectedAddress.phone || "",
                  receiverName: selectedAddress.receiverName || "",
                  receiverPhone: selectedAddress.receiverPhone || selectedAddress.phone || "",
                  landmark: selectedAddress.landmark || "",
                  formattedAddress: selectedAddress.addressLine,
                },
                latitude: dropLat,
                longitude: dropLng,
                type: "drop",
                items: orderItems,
              },
            ],
          },
        }),
      });

      const finalOrder = verifyResponse.order;
      setOrderId(finalOrder._id || finalOrder.id);
      setServiceType("delivery");
      setStatus("confirmed");
      clearCart();
      router.replace({ pathname: "/finding-driver", params: { orderId: finalOrder._id || finalOrder.id } });
    } catch (error: any) {
      console.error("Payment failed", error);
      Alert.alert("Payment failed", error?.message || "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScreenShell>
      <Header
        title="Payment"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + 6, paddingBottom: 12 }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 150 }} showsVerticalScrollIndicator={false}>
        <PaymentAmountHeader
          getItemCount={getItemCount}
          items={items}
          styles={styles}
          total={total}
          vendorName={vendorName}
        />

        <Animated.View entering={fadeInUp(60)} style={styles.section}>
          <PaymentBillCard
            couponCode={couponCode}
            deliveryFee={deliveryFee}
            discount={discount}
            styles={styles}
            subtotal={subtotal}
            tip={tip}
            tokens={tokens}
            total={total}
          />
        </Animated.View>

        <Animated.View entering={fadeInUp(120)} style={styles.section}>
          <PaymentAddressCard
            receiverContact={receiverContact}
            selectedAddress={selectedAddress}
            styles={styles}
          />
        </Animated.View>

        <Animated.View entering={fadeInUp(180)} style={styles.section}>
          <Text style={styles.sectionLabel}>Payment</Text>
          <PaymentMethodRow
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>

        <Animated.View entering={fadeInUp(240)} style={styles.section}>
          <PaymentTrustNote
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>
      </ScrollView>

      <PaymentFooter
        accent={accent}
        handlePayment={handlePayment}
        insets={insets}
        processing={processing}
        styles={styles}
        total={total}
      />
    </ScreenShell>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({

    payingBlock: { alignItems: "center", paddingHorizontal: 16, paddingTop: 18 },
    payingEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted },
    payingAmount: { fontFamily: fontFamilies.heading.bold, fontSize: moderateScale(44), lineHeight: moderateScale(46), letterSpacing: -0.8, color: tokens.text, marginTop: 8 },
    payingSub: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 8 },

    section: { paddingHorizontal: 16, paddingTop: 18 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },

    billCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 16, gap: 11 },
    billRow: { flexDirection: "row", justifyContent: "space-between" },
    billLabel: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(15), color: tokens.sec },
    billValue: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text },
    billNote: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), color: tokens.muted },
    billDivider: { borderTopWidth: 1, borderTopColor: tokens.borderStrong, borderStyle: "dashed", marginTop: 3, paddingTop: 1 },
    billTotalLabel: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(17), color: tokens.text },
    billTotalValue: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(17), color: tokens.text },

    addressCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 14 },
    addressAvatar: { width: 34, height: 34, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    addressAvatarText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14), color: accent.accent },
    addressTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    addressLine: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(18), color: tokens.sec, marginTop: 3 },
    addressContact: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 5 },

    methodRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 16, padding: 14, minHeight: 64 },
    methodIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    methodTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    methodSub: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(18), color: tokens.sec, marginTop: 2 },

    trustRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: tokens.successSkin, borderRadius: 14, padding: 13 },
    trustText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(19), color: tokens.sec },

    footer: {
      position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface,
      borderTopWidth: 1, borderTopColor: tokens.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 14,
    },
    payBtn: {
      backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    payBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },
    payBtnPrice: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on, opacity: 0.85 },
  });
