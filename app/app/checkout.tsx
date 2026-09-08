import React, { useEffect, useMemo, useState } from "react";
import { CheckoutBody } from "@/features/food/components/CheckoutBody";
import { CheckoutFooter } from "@/features/food/components/CheckoutFooter";
import { Alert } from "react-native";

import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/components/ui/Header";
import { createStyles } from "@/features/food/checkout.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useAuthStore } from "@/contexts/authStore";
import { useServiceAccent } from "@/contexts/homeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { RazorpayIntegration } from "@/utils/razorpay";
import { ScheduleDateTimeSheet } from "@/components/ScheduleDateTimeSheet";
import { ScreenShell } from "@/components/ui/ScreenShell";

const TIP_OPTIONS = [0, 20, 30, 50];

interface ApplicableCoupon {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrder: number;
  isApplicable?: boolean;
  amountToUnlock?: number;
}

const cleanApiMessage = (message?: string, fallback = "Something went wrong") =>
  (message || fallback).replace(/^HTTP \d+.*?: /, "").trim();

const formatSlot = (date: Date) =>
  date.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function FoodCheckoutScreen() {
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
      const response = await customFetch<{ valid: boolean; code: string; discountAmount: number }>(
        "/coupons/validate",
        {
          method: "POST",
          body: JSON.stringify({ code: trimmed, vendorId, subtotal }),
        }
      );
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
    customFetch<{ coupons: ApplicableCoupon[] }>(`/coupons/applicable${query}`)
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

  const placeOrder = async () => {
    if (getItemCount() === 0) {
      Alert.alert("Cart is empty", "Please add at least one item.");
      return;
    }
    if (!user || !token) {
      Alert.alert("Login required", "Please log in before placing your order.");
      router.push("/login");
      return;
    }
    if (addressIssue || !selectedAddress) {
      Alert.alert("Delivery details needed", addressIssue || "Select a delivery address to continue.");
      router.push("/delivery/saved-addresses");
      return;
    }
    if (!vendorId) {
      Alert.alert("Restaurant missing", "Please choose a restaurant again.");
      return;
    }
    // The slot can lapse between picking it and paying; the server rejects a
    // past scheduledFor, so catch it before anything is charged.
    if (scheduledFor && scheduledFor.getTime() <= Date.now()) {
      Alert.alert("Invalid time", "Please choose a future delivery time.");
      setShowScheduleSheet(true);
      return;
    }

    const deliveryAddressObj = {
      label: selectedAddress.label || "",
      addressLine: selectedAddress.addressLine,
      phone: receiverPhone,
      receiverName: selectedAddress.receiverName || "",
      receiverPhone,
      landmark: selectedAddress.landmark || "",
      formattedAddress: selectedAddress.addressLine,
    };
    const dropLat = Number(selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1] ?? 17.0005);
    const dropLng = Number(selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0] ?? 81.804);

    setIsPlacingOrder(true);
    try {
      const orderItems = items.map((item) => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        // Kept so "order again" can rebuild the cart with thumbnails.
        image: item.images?.[0],
        isVeg: item.isVeg,
        category: item.category,
      }));

      const orderDataPayload = {
        serviceType: "delivery",
        vendorId,
        // `discount`/`total` are only a preview — the server re-derives both from
        // `couponCode`, so the code is the number that actually counts.
        totals: {
          subtotal,
          deliveryFee: deliveryFee || 0,
          tip: activeTip,
          discount,
          total,
          couponCode: appliedPromo?.code || undefined,
        },
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : undefined,
        scheduledDelivery: scheduledFor
          ? { type: "later", requestedAt: scheduledFor.toISOString() }
          : { type: "now" },
        stops: [
          {
            id: "vendor-pickup",
            address: vendorName || "Restaurant pickup",
            storeName: vendorName || "Restaurant",
            latitude: dropLat + 0.004,
            longitude: dropLng + 0.004,
            type: "pickup",
            items: [],
          },
          {
            id: "customer-drop",
            address: deliveryAddressObj.formattedAddress,
            deliveryAddress: deliveryAddressObj,
            latitude: dropLat,
            longitude: dropLng,
            type: "drop",
            items: orderItems,
          },
        ],
      };

      let finalOrderId: string;

      const rzpOrderResponse = await customFetch<any>("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: total }),
      });

      const rzpResult = await RazorpayIntegration.open({
        order_id: rzpOrderResponse.id,
        key: rzpOrderResponse.key,
        amount: rzpOrderResponse.amount,
        currency: rzpOrderResponse.currency,
        name: rzpOrderResponse.name,
        prefill: rzpOrderResponse.prefill,
        theme: rzpOrderResponse.theme,
      });

      const verifyResponse = await customFetch<any>("/payments/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_payment_id: rzpResult.razorpay_payment_id,
          razorpay_order_id: rzpResult.razorpay_order_id,
          razorpay_signature: rzpResult.razorpay_signature,
          orderData: orderDataPayload,
        }),
      });

      finalOrderId = verifyResponse.order._id || verifyResponse.order.id;

      setOrderId(finalOrderId);
      setServiceType("delivery");
      setStatus("pending");
      clearCart();

      if (scheduledFor) {
        // No driver is dispatched for a slot hours away, so finding-driver would
        // spin forever — the order waits under Scheduled in My orders instead.
        router.replace("/(tabs)/orders");
        return;
      }
      router.replace({ pathname: "/finding-driver", params: { orderId: finalOrderId } });
    } catch (error: any) {
      console.error("Place order failed", error);
      Alert.alert("Order failed", error?.message || "Unable to place your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <ScreenShell>
      <Header
        title="Checkout"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + 6, paddingBottom: 12 }}
      />

      <CheckoutBody
        TIP_OPTIONS={TIP_OPTIONS}
        formatSlot={formatSlot}
        accent={accent}
        activeTip={activeTip}
        addressIssue={addressIssue}
        appliedPromo={appliedPromo}
        applyCode={applyCode}
        applyingCode={applyingCode}
        deliveryFee={deliveryFee}
        getItemCount={getItemCount}
        insets={insets}
        isApplyingPromo={isApplyingPromo}
        isOtherTip={isOtherTip}
        items={items}
        offers={offers}
        otherTipText={otherTipText}
        promoCodeText={promoCodeText}
        promoError={promoError}
        receiverName={receiverName}
        receiverPhone={receiverPhone}
        removeCode={removeCode}
        scheduledFor={scheduledFor}
        selectedAddress={selectedAddress}
        setIsOtherTip={setIsOtherTip}
        setOtherTipText={setOtherTipText}
        setPromoCodeText={setPromoCodeText}
        setScheduledFor={setScheduledFor}
        setShowPromoInput={setShowPromoInput}
        setShowScheduleSheet={setShowScheduleSheet}
        setTipAmount={setTipAmount}
        showPromoInput={showPromoInput}
        styles={styles}
        subtotal={subtotal}
        tipAmount={tipAmount}
        tokens={tokens}
        total={total}
      />

      <CheckoutFooter
        accent={accent}
        addressIssue={addressIssue}
        insets={insets}
        isPlacingOrder={isPlacingOrder}
        placeOrder={placeOrder}
        scheduledFor={scheduledFor}
        styles={styles}
        tokens={tokens}
        total={total}
      />

      <ScheduleDateTimeSheet
        visible={showScheduleSheet}
        onClose={() => setShowScheduleSheet(false)}
        onConfirm={(date) => {
          setScheduledFor(date);
          setShowScheduleSheet(false);
        }}
        title="Schedule delivery"
        subtitle="Pick when you want your food delivered"
        confirmLabel="Confirm slot"
        initialDate={scheduledFor ?? undefined}
        accent={accent.accent}
      />
    </ScreenShell>
  );
}
