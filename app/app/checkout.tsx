import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useAuthStore } from "@/contexts/authStore";
import { useServiceAccent } from "@/contexts/homeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { RazorpayIntegration } from "@/utils/razorpay";
import { ScheduleDateTimeSheet } from "@/components/ScheduleDateTimeSheet";
import { fadeInUp } from "@/motion/presets";

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
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitleSolo}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 150 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={fadeInUp(0)} style={styles.section}>
          <TouchableOpacity
            style={[styles.addressCard, !!addressIssue && styles.addressCardBlocked]}
            activeOpacity={0.85}
            onPress={() => router.push("/delivery/saved-addresses")}
          >
            <View style={styles.addressAvatar}>
              <Text style={styles.addressAvatarText}>{(selectedAddress?.label || "H")[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.addressTitle}>Deliver to {selectedAddress?.label || "…"}</Text>
              <Text style={styles.addressLine} numberOfLines={2}>
                {selectedAddress?.addressLine || "Select a delivery address"}
              </Text>
              {!!selectedAddress?.landmark && (
                <Text style={styles.addressContact}>Near {selectedAddress.landmark}</Text>
              )}
              {(!!receiverName || !!receiverPhone) && (
                <Text style={styles.addressContact}>{[receiverName, receiverPhone].filter(Boolean).join(" · ")}</Text>
              )}
              {!!addressIssue && (
                <View style={styles.addressWarnRow}>
                  <Ionicons name="alert-circle" size={moderateScale(14)} color={tokens.error} />
                  <Text style={styles.addressWarnText}>{addressIssue}</Text>
                </View>
              )}
            </View>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={fadeInUp(60)} style={styles.section}>
          <View style={styles.orderCard}>
            <View style={styles.orderCardHead}>
              <Text style={styles.orderCardTitle}>Your order · {getItemCount()} items</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.changeLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            {items.map((item) => (
              <View key={item._id} style={styles.orderLine}>
                <Text style={styles.orderLineLabel} numberOfLines={1}>{item.quantity} × {item.name}</Text>
                <Text style={styles.orderLineValue}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={fadeInUp(90)} style={styles.section}>
          <Text style={styles.sectionLabel}>Delivery time</Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              style={[styles.couponOptionRow, !scheduledFor && { borderColor: accent.accent, backgroundColor: accent.skin }]}
              activeOpacity={0.85}
              onPress={() => setScheduledFor(null)}
            >
              <View style={styles.radioSelected}>{!scheduledFor && <View style={[styles.radioDot, { backgroundColor: accent.accent }]} />}</View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.couponCode}>Deliver now</Text>
                <Text style={styles.couponDesc}>We start preparing as soon as you order.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.couponOptionRow, !!scheduledFor && { borderColor: accent.accent, backgroundColor: accent.skin }]}
              activeOpacity={0.85}
              onPress={() => setShowScheduleSheet(true)}
            >
              <View style={styles.radioSelected}>{!!scheduledFor && <View style={[styles.radioDot, { backgroundColor: accent.accent }]} />}</View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.couponCode}>Schedule for later</Text>
                <Text style={styles.couponDesc}>
                  {scheduledFor ? formatSlot(scheduledFor) : "Pick a future date and time"}
                </Text>
              </View>
              <Text style={styles.changeLink}>{scheduledFor ? "Edit" : "Pick"}</Text>
            </TouchableOpacity>
          </View>
          {!!scheduledFor && (
            <Text style={styles.scheduleNote}>
              The restaurant confirms scheduled slots — you&apos;ll see it as pending under Scheduled in My orders.
            </Text>
          )}
        </Animated.View>

        <Animated.View entering={fadeInUp(120)} style={styles.section}>
          <Text style={styles.sectionLabel}>Offers &amp; coupons</Text>
          {appliedPromo ? (
            <View style={[styles.couponOptionRow, { borderColor: accent.accent, backgroundColor: accent.skin }]}>
              <View style={styles.radioSelected}><View style={[styles.radioDot, { backgroundColor: accent.accent }]} /></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.couponCode}>{appliedPromo.code}</Text>
                <Text style={styles.couponDesc}>You saved ₹{appliedPromo.discountAmount}</Text>
              </View>
              <TouchableOpacity onPress={removeCode}>
                <Text style={styles.changeLink}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {offers.map((offer) => {
                const locked = offer.isApplicable === false;
                return (
                  <View key={offer.code} style={[styles.couponOptionRow, locked && styles.couponOptionRowLocked]}>
                    <View style={styles.couponIconCircle}>
                      <Ionicons name="pricetag" size={moderateScale(15)} color={accent.accent} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.couponCode}>{offer.code}</Text>
                      <Text style={styles.couponDesc}>{offer.title}</Text>
                      <Text style={styles.couponSaving}>
                        {locked
                          ? `Add ₹${Math.max(0, Math.round(offer.amountToUnlock ?? offer.minOrder - subtotal))} more to use this`
                          : `Saves ₹${offer.discountAmount} on this order`}
                      </Text>
                    </View>
                    <TouchableOpacity disabled={locked || isApplyingPromo} onPress={() => applyCode(offer.code)}>
                      {applyingCode === offer.code ? (
                        <ActivityIndicator size="small" color={accent.accent} />
                      ) : (
                        <Text style={[styles.changeLink, locked && { color: tokens.muted }]}>Apply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}

              {showPromoInput ? (
                <View style={styles.promoInputRow}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Enter promo code"
                    placeholderTextColor={tokens.muted}
                    autoCapitalize="characters"
                    value={promoCodeText}
                    onChangeText={setPromoCodeText}
                  />
                  <TouchableOpacity style={styles.promoApplyBtn} onPress={() => applyCode(promoCodeText)} disabled={isApplyingPromo}>
                    {isApplyingPromo && !applyingCode ? (
                      <ActivityIndicator size="small" color={accent.on} />
                    ) : (
                      <Text style={styles.promoApplyBtnText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.couponOptionRow} activeOpacity={0.85} onPress={() => setShowPromoInput(true)}>
                  <Ionicons name="pricetag-outline" size={moderateScale(18)} color={tokens.sec} />
                  <Text style={[styles.couponCode, { flex: 1 }]}>Have a promo code?</Text>
                  <Text style={styles.changeLink}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}
        </Animated.View>

        <Animated.View entering={fadeInUp(180)} style={styles.section}>
          <Text style={styles.sectionLabel}>Tip your delivery partner</Text>
          <Text style={styles.tipSub}>100% of the tip goes to the partner.</Text>
          <View style={styles.tipRow}>
            {TIP_OPTIONS.map((opt) => {
              const isSelected = !isOtherTip && tipAmount === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.tipPill, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}
                  onPress={() => { setIsOtherTip(false); setTipAmount(opt); }}
                >
                  <Text style={[styles.tipPillText, isSelected && { color: accent.on }]}>{opt === 0 ? "None" : `₹${opt}`}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.tipPill, isOtherTip && { backgroundColor: accent.accent, borderColor: accent.accent }]}
              onPress={() => setIsOtherTip(true)}
            >
              <Text style={[styles.tipPillText, isOtherTip && { color: accent.on }]}>Other</Text>
            </TouchableOpacity>
          </View>
          {isOtherTip && (
            <TextInput
              style={styles.otherTipInput}
              placeholder="Enter amount"
              placeholderTextColor={tokens.muted}
              keyboardType="numeric"
              value={otherTipText}
              onChangeText={setOtherTipText}
            />
          )}
        </Animated.View>

        <Animated.View entering={fadeInUp(240)} style={styles.section}>
          <Text style={styles.sectionLabel}>Bill details</Text>
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item total</Text>
              <Text style={styles.billValue}>₹{subtotal}</Text>
            </View>
            {deliveryFee != null ? (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery fee</Text>
                <Text style={styles.billValue}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text>
              </View>
            ) : (
              <Text style={styles.billNote}>Delivery fee is confirmed with your order.</Text>
            )}
            {activeTip > 0 && (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery tip</Text>
                <Text style={styles.billValue}>₹{activeTip}</Text>
              </View>
            )}
            {appliedPromo && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: tokens.success }]}>Coupon {appliedPromo.code}</Text>
                <Text style={[styles.billValue, { color: tokens.success }]}>−₹{appliedPromo.discountAmount}</Text>
              </View>
            )}
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={styles.billTotalLabel}>To pay</Text>
              <Text style={styles.billTotalValue}>₹{total}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {!!addressIssue && (
          <TouchableOpacity
            style={styles.blockedNote}
            activeOpacity={0.8}
            onPress={() => router.push("/delivery/saved-addresses")}
          >
            <Ionicons name="alert-circle" size={moderateScale(14)} color={tokens.error} />
            <Text style={styles.blockedNoteText}>{addressIssue}</Text>
            <Text style={styles.changeLink}>Fix</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.placeOrderBtn, (isPlacingOrder || !!addressIssue) && styles.placeOrderBtnDisabled]}
          activeOpacity={0.9}
          onPress={placeOrder}
          disabled={isPlacingOrder || !!addressIssue}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color={accent.on} />
          ) : (
            <>
              <Text style={styles.placeOrderBtnText}>{scheduledFor ? "Schedule order" : "Place order"}</Text>
              <Text style={styles.placeOrderBtnPrice}>· ₹{total}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
    </View>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
    iconBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitleSolo: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(17), color: tokens.text },

    section: { paddingHorizontal: 16, paddingTop: 18 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12 },

    addressCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 14 },
    addressCardBlocked: { borderColor: tokens.error, backgroundColor: tokens.errorSkin },
    addressAvatar: { width: 34, height: 34, borderRadius: 11, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    addressAvatarText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14), color: accent.accent },
    addressTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    addressLine: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), lineHeight: moderateScale(20), color: tokens.sec, marginTop: 3 },
    addressContact: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 5 },
    addressWarnRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    addressWarnText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.error },
    changeLink: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(12), letterSpacing: 0.5, textTransform: "uppercase", color: accent.accent, flexShrink: 0 },

    orderCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 14 },
    orderCardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    orderCardTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    orderLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
    orderLineLabel: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), color: tokens.sec, marginRight: 10 },
    orderLineValue: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.text },

    couponOptionRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 13, minHeight: 56 },
    couponOptionRowLocked: { opacity: 0.55 },
    couponIconCircle: { width: 32, height: 32, borderRadius: 10, backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    couponSaving: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(12), color: tokens.success, marginTop: 3 },
    radioSelected: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: accent.accent, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    radioDot: { width: 10, height: 10, borderRadius: 5 },
    couponCode: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    couponDesc: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 2 },
    scheduleNote: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(12), lineHeight: moderateScale(18), color: tokens.sec, marginTop: 10 },
    promoInputRow: { flexDirection: "row", gap: 10 },
    promoInput: {
      flex: 1, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 12,
      paddingHorizontal: 14, height: moderateScale(44), fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.text,
    },
    promoApplyBtn: { backgroundColor: accent.accent, borderRadius: 12, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
    promoApplyBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(13), color: accent.on },
    promoError: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.error, marginTop: 8 },

    tipSub: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(19), color: tokens.sec, marginTop: -6, marginBottom: 12 },
    tipRow: { flexDirection: "row", gap: 8 },
    tipPill: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 12, paddingVertical: 12, alignItems: "center", minHeight: 44 },
    tipPillText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text },
    otherTipInput: {
      marginTop: 10, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 12,
      paddingHorizontal: 14, height: moderateScale(44), fontFamily: fontFamilies.body.medium, fontSize: moderateScale(14), color: tokens.text,
    },

    billCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 18, padding: 16, gap: 11 },
    billRow: { flexDirection: "row", justifyContent: "space-between" },
    billLabel: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(15), color: tokens.sec },
    billValue: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text },
    billNote: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), color: tokens.muted },
    billDivider: { borderTopWidth: 1, borderTopColor: tokens.borderStrong, borderStyle: "dashed", marginTop: 3, paddingTop: 1 },
    billTotalLabel: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(17), color: tokens.text },
    billTotalValue: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(24), letterSpacing: -0.3, color: tokens.text },

    footer: {
      position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface,
      borderTopWidth: 1, borderTopColor: tokens.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 14,
    },
    blockedNote: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    blockedNoteText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.error },
    placeOrderBtn: {
      backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52),
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    },
    placeOrderBtnDisabled: { opacity: 0.5 },
    placeOrderBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },
    placeOrderBtnPrice: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on, opacity: 0.85 },
  });
