import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import Animated from "react-native-reanimated";
import { designTokens, type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useCartStore } from "@/contexts/cartStore";
import { useHomeStore } from "@/contexts/homeStore";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";
import { Button } from "@/components/ui/Button";
import { fadeInDown, fadeInUp, staggerListItem } from "@/motion/presets";

// Inverted on purpose. In-flight statuses are written in both cases by the
// driver, vendor and admin apps (en_route_pickup, PICKING_ITEMS, CREATED, …),
// so enumerating them is what put live orders under "Past". Only a finished
// order is enumerable.
const TERMINAL_STATUSES = ["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"];
const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

function isTerminalOrder(order: any): boolean {
  return TERMINAL_STATUSES.includes(String(order?.status || "").toUpperCase());
}

function isScheduledOrder(order: any): boolean {
  return !!order?.scheduledFor || !!order?.isReserved || order?.scheduledDelivery?.type === "later";
}

function scheduledSlot(order: any): Date | null {
  const raw = order?.scheduledFor || order?.scheduledDelivery?.requestedAt || order?.reservedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

const SCHEDULE_PILL: Record<string, string> = {
  pending: "Awaiting restaurant",
  accepted: "Confirmed",
  rejected: "Rejected",
};

/**
 * Stop lines are persisted as `items: { lines: [...] }`, and every order now
 * also carries a flat top-level `items`. Prefer the flat one and fall back for
 * anything stored before it existed.
 */
function readOrderLines(order: any): any[] {
  if (Array.isArray(order?.items) && order.items.length) return order.items;
  const stops = Array.isArray(order?.stops) ? order.stops : [];
  return stops.flatMap((stop: any) => readStopLines(stop));
}

function readStopLines(stop: any): any[] {
  const raw = stop?.items;
  if (Array.isArray(raw)) return raw;
  return Array.isArray(raw?.lines) ? raw.lines : [];
}

function toCartItem(line: any) {
  return {
    _id: String(line?.id || line?._id || line?.itemId || ""),
    name: String(line?.name || "Item"),
    description: String(line?.description || ""),
    price: Number(line?.price) || 0,
    category: String(line?.category || ""),
    isVeg: line?.isVeg !== false,
    images: Array.isArray(line?.images) && line.images.length
      ? line.images
      : line?.image
        ? [String(line.image)]
        : [],
    quantity: Math.max(1, Math.round(Number(line?.quantity) || 1)),
  };
}

const SERVICE_META: Record<string, { label: string; accent: keyof ThemeTokens["services"] }> = {
  food: { label: "Food", accent: "food" },
  meat: { label: "Meat", accent: "meat" },
  bike: { label: "Ride", accent: "ride" },
  auto: { label: "Ride", accent: "ride" },
  cab: { label: "Ride", accent: "ride" },
  cab_prime: { label: "Ride", accent: "ride" },
  helper: { label: "Task", accent: "task" },
  delivery: { label: "Delivery", accent: "delivery" },
};

const REVIEW_TAGS = ["⚡ On time", "😊 Polite partner", "🍱 Great quality", "📦 Well packaged", "🚗 Safe trip"];

function resolveServiceKey(order: any): string {
  if (order.serviceType === "delivery" && order.vendor) {
    // GET /api/v1/orders doesn't populate vendor (it's a raw id here), so
    // there's no real field to tell a food order from a meat one at this
    // list level — labelled "Food" as the more common case rather than
    // guessing from a partnerType that isn't actually present on this
    // response.
    return "food";
  }
  return order.serviceType || "delivery";
}

function activeStatusCaption(order: any, serviceKey: string): string {
  const status = String(order.status || "").toUpperCase();
  if (serviceKey === "food" || serviceKey === "meat") {
    if (["EN_ROUTE_DELIVERY", "PICKED_UP", "ON_THE_WAY"].includes(status)) return "Out for delivery";
    if (["PICKING_ITEMS", "ARRIVED_PICKUP"].includes(status)) return "Preparing your order";
    return "Order confirmed";
  }
  if (serviceKey === "helper") {
    if (["EN_ROUTE_PICKUP", "DRIVER_ASSIGNED", "driver_assigned"].includes(status)) return "Helper on the way";
    return "Matching a helper";
  }
  if (serviceKey === "delivery") return "Rider on the route";
  if (["DRIVER_ASSIGNED", "driver_assigned"].includes(status)) return "Captain assigned";
  return "Finding your captain";
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [theme]);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilters, setServiceFilters] = useState<Set<string>>(new Set());
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [pendingServiceFilters, setPendingServiceFilters] = useState<Set<string>>(new Set());

  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await customFetch<any[]>("/orders");
      if (data) setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const withKey = useMemo(() => orders.map((o) => ({ ...o, __serviceKey: resolveServiceKey(o) })), [orders]);
  const filtered = useMemo(
    () => (serviceFilters.size === 0 ? withKey : withKey.filter((o) => serviceFilters.has(o.__serviceKey))),
    [withKey, serviceFilters]
  );
  const scheduled = filtered.filter((o) => isScheduledOrder(o) && !isTerminalOrder(o));
  const active = filtered.filter((o) => !isScheduledOrder(o) && !isTerminalOrder(o));
  const past = filtered.filter((o) => isTerminalOrder(o));

  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    withKey.forEach((o) => { counts[o.__serviceKey] = (counts[o.__serviceKey] || 0) + 1; });
    return counts;
  }, [withKey]);

  const handleOpenReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    setReviewRating(5);
    setReviewComment("");
    setReviewTags([]);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderForReview) return;
    try {
      setSubmittingReview(true);
      await customFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({ orderId: selectedOrderForReview._id, rating: reviewRating, comment: reviewComment, tags: reviewTags }),
      });
      setOrders((prev) => prev.map((o) => (o._id === selectedOrderForReview._id ? { ...o, isReviewed: true } : o)));
      setSelectedOrderForReview(null);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  /**
   * Rebuilds the cart from a past order. The server's reorder endpoint is the
   * source of truth (it also writes the saved cart); the order's own lines are
   * the offline fallback. Nothing is cleared until we know there are items —
   * a failed reorder must not wipe a cart the customer was building.
   */
  const reorderIntoCart = async (order: any, serviceKey: string) => {
    const vendorId = typeof order.vendor === "object" ? order.vendor?._id : order.vendor;
    const vendorName = typeof order.vendor === "object" ? order.vendor?.name : undefined;

    setReorderingId(order._id);
    try {
      let cartVendorId: string | null = vendorId || null;
      let cartItems = [] as ReturnType<typeof toCartItem>[];

      try {
        const cart = await customFetch<{ vendorId: string | null; items: any[] }>(
          `/orders/${order._id}/reorder`,
          { method: "POST" }
        );
        cartItems = (cart?.items || []).map(toCartItem).filter((item) => !!item._id);
        cartVendorId = cart?.vendorId ?? cartVendorId;
      } catch {
        cartItems = readOrderLines(order).map(toCartItem).filter((item) => !!item._id);
      }

      if (!cartVendorId || cartItems.length === 0) {
        Alert.alert("Can't reorder", "We couldn't find the items from this order. Please add them from the menu.");
        return;
      }

      useCartStore.getState().replaceCart(cartVendorId, cartItems, vendorName);
      // Keeps the cart in the mode the order was placed in instead of inheriting
      // whatever the home tab was last left on.
      useHomeStore.getState().setActiveService(serviceKey === "meat" ? "Meat" : "Food");
      router.push("/cart");
    } finally {
      setReorderingId(null);
    }
  };

  const handleReorder = (order: any) => {
    const serviceKey = order.__serviceKey || resolveServiceKey(order);

    if (RIDE_TYPES.includes(order.serviceType)) {
      const pickup = order.stops?.find((s: any) => s.type === "pickup") || order.stops?.[0];
      const drop = order.stops?.find((s: any) => s.type === "drop") || order.stops?.[order.stops.length - 1];
      if (!pickup || !drop) return;
      router.push({
        pathname: "/ride-confirmation",
        params: {
          serviceId: order.serviceType,
          pickupName: pickup.address || "Pickup",
          pickupLat: String(pickup.location?.coordinates?.[1] || 0),
          pickupLng: String(pickup.location?.coordinates?.[0] || 0),
          dropName: drop.address || "Drop",
          dropLat: String(drop.location?.coordinates?.[1] || 0),
          dropLng: String(drop.location?.coordinates?.[0] || 0),
        },
      });
      return;
    }

    if (order.serviceType === "helper") {
      router.push("/helper-task");
      return;
    }

    if (serviceKey === "food" || serviceKey === "meat") {
      void reorderIntoCart(order, serviceKey);
      return;
    }

    // Package delivery — prefill the real multi-stop entry screen instead
    // of routing it through the food-cart flow it doesn't belong to.
    const { resetDelivery, addStop } = useDeliveryStore.getState();
    resetDelivery();
    (order.stops || [])
      .filter((s: any) => s.type !== "pickup")
      .forEach((s: any) => {
        const stopItems = readStopLines(s).map((line: any) => ({
          id: String(line?.id || line?._id || ""),
          name: String(line?.name || "Item"),
          quantity: Math.max(1, Math.round(Number(line?.quantity) || 1)),
          estimatedPrice: line?.estimatedPrice ?? line?.price,
        }));
        addStop(s.address || "Stop", undefined, stopItems, s.location?.coordinates?.[1], s.location?.coordinates?.[0]);
      });
    router.push("/delivery/entry");
  };

  const openFilterSheet = () => {
    setPendingServiceFilters(new Set(serviceFilters));
    setShowFilterSheet(true);
  };
  const applyFilters = () => {
    setServiceFilters(new Set(pendingServiceFilters));
    setShowFilterSheet(false);
  };
  const toggleServiceFilter = (key: string) => {
    setPendingServiceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const pendingCount = useMemo(() => {
    if (pendingServiceFilters.size === 0) return withKey.length;
    return withKey.filter((o) => pendingServiceFilters.has(o.__serviceKey)).length;
  }, [withKey, pendingServiceFilters]);

  const isEmpty = !loading && orders.length === 0;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.header, { paddingTop: insets.top + 14 }]} entering={fadeInDown(0)}>
        <Text style={styles.headline}>My orders</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={openFilterSheet}>
          <Ionicons name="options-outline" size={moderateScale(17)} color={tokens.text} />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, gap: 12 }}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={[styles.skeletonBar, { width: "22%", height: 11, marginBottom: 12 }]} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={[styles.skeletonBar, { width: 52, height: 52, borderRadius: 8 }]} />
                <View style={{ flex: 1, justifyContent: "center", gap: 8 }}>
                  <View style={[styles.skeletonBar, { width: "56%", height: 14 }]} />
                  <View style={[styles.skeletonBar, { width: "74%", height: 12 }]} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : isEmpty ? (
        <Animated.View style={styles.emptyWrap} entering={fadeInUp(0)}>
          <View style={styles.emptyIconCircle}><Ionicons name="receipt-outline" size={moderateScale(28)} color={tokens.brand} /></View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Food, meat, rides, helpers and courier runs will all show up here once you place your first one.</Text>
          <Button title="Explore Flavour" onPress={() => router.replace("/(tabs)")} fullWidth />
        </Animated.View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }} showsVerticalScrollIndicator={false}>
          <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} entering={fadeInUp(40)}>
            <TouchableOpacity style={[styles.chip, serviceFilters.size === 0 && styles.chipActive]} onPress={() => setServiceFilters(new Set())}>
              <Text style={[styles.chipText, serviceFilters.size === 0 && styles.chipTextActive]}>All</Text>
            </TouchableOpacity>
            {Object.entries(SERVICE_META).filter(([k]) => k !== "bike" && k !== "auto" && k !== "cab" && k !== "cab_prime").map(([key, meta]) => {
              const isActive = serviceFilters.has(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setServiceFilters((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; })}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{meta.label}</Text>
                </TouchableOpacity>
              );
            })}
          </Animated.ScrollView>

          {scheduled.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Scheduled</Text>
              {scheduled.map((order, index) => {
                const accent = tokens.services[SERVICE_META[order.__serviceKey]?.accent || "ride"];
                const slot = scheduledSlot(order);
                const scheduleStatus = String(order.scheduleStatus || "");
                const pillLabel = SCHEDULE_PILL[scheduleStatus];
                const isAccepted = scheduleStatus === "accepted";
                return (
                  <Animated.View key={order._id} style={[styles.card, { borderLeftColor: accent.accent, borderLeftWidth: 3, marginBottom: 12 }]} entering={staggerListItem(index)}>
                    <View style={styles.liveRow}>
                      <Text style={[styles.cardEyebrow, { color: accent.accent }]}>{SERVICE_META[order.__serviceKey]?.label} · scheduled</Text>
                      {!!pillLabel && (
                        <View style={[styles.schedulePill, isAccepted && { backgroundColor: tokens.successSkin }]}>
                          <Text style={[styles.schedulePillText, isAccepted && { color: tokens.success }]}>{pillLabel}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardTitle}>{slot ? slot.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Scheduled"}</Text>
                    <Text style={styles.cardMeta} numberOfLines={1}>
                      {typeof order.vendor === "object" ? order.vendor?.name : order.stops?.map((s: any) => s.address).join(" → ")}
                    </Text>
                    <Text style={styles.cardMeta}>est. ₹{Math.round(order.totalPrice || 0)}</Text>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionBtnOutline} onPress={() => router.push({ pathname: "/tracking", params: { orderId: order._id } })}>
                        <Text style={styles.actionBtnOutlineText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {active.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Active now</Text>
              {active.map((order, index) => {
                const accent = tokens.services[SERVICE_META[order.__serviceKey]?.accent || "ride"];
                return (
                  <Animated.View key={order._id} style={[styles.card, { borderLeftColor: accent.accent, borderLeftWidth: 3, marginBottom: 12 }]} entering={staggerListItem(index)}>
                    <View style={styles.liveRow}>
                      <Text style={[styles.cardEyebrow, { color: accent.accent }]}>{SERVICE_META[order.__serviceKey]?.label}</Text>
                      <View style={styles.liveDot}><View style={[styles.liveDotCore, { backgroundColor: accent.accent }]} /></View>
                      <Text style={[styles.liveLabel, { color: accent.accent }]}>{activeStatusCaption(order, order.__serviceKey)}</Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>{typeof order.vendor === "object" ? order.vendor?.name : order.stops?.[0]?.address || "Order"}</Text>
                    <Text style={styles.cardMeta}>₹{Math.round(order.totalPrice || 0)}</Text>
                    <TouchableOpacity style={[styles.trackBtn, { backgroundColor: accent.accent }]} onPress={() => router.push({ pathname: "/tracking", params: { orderId: order._id } })}>
                      <Text style={[styles.trackBtnText, { color: accent.on }]}>Track order</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {past.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Past</Text>
              {past.map((order, index) => {
                const accent = tokens.services[SERVICE_META[order.__serviceKey]?.accent || "ride"];
                const isRejected = String(order.scheduleStatus || "") === "rejected";
                const isCancelled = String(order.status).toUpperCase() === "CANCELLED" || isRejected;
                const isDelivered = ["DELIVERED", "COMPLETED", "delivered", "completed"].includes(order.status);
                const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString([], { day: "numeric", month: "short" }) : "";
                const isReordering = reorderingId === order._id;
                return (
                  <Animated.View key={order._id} style={[styles.card, { borderLeftColor: isCancelled ? tokens.borderStrong : accent.accent, borderLeftWidth: 3, marginBottom: 12 }]} entering={staggerListItem(index)}>
                    <View style={styles.liveRow}>
                      <Text style={[styles.cardEyebrow, { color: isCancelled ? tokens.muted : accent.accent }]}>{SERVICE_META[order.__serviceKey]?.label}</Text>
                      {isCancelled ? (
                        <View style={styles.cancelledBadge}><Text style={styles.cancelledBadgeText}>{isRejected ? "Rejected" : "Cancelled"}</Text></View>
                      ) : (
                        <Text style={styles.cardMetaRight}>{dateStr}</Text>
                      )}
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>{typeof order.vendor === "object" ? order.vendor?.name : order.stops?.map((s: any) => s.address).join(" → ") || "Order"}</Text>
                    <Text style={styles.cardMeta}>₹{Math.round(order.totalPrice || 0)}{order.__serviceKey === "delivery" ? " delivery" : ""}</Text>
                    {isRejected && (
                      <Text style={styles.rejectionReason}>
                        {order.scheduleRejectionReason || "The restaurant could not take this order for the requested slot."}
                      </Text>
                    )}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtnFilled, { backgroundColor: accent.skin, borderColor: accent.accent }]}
                        onPress={() => handleReorder(order)}
                        disabled={isReordering}
                      >
                        {isReordering ? (
                          <ActivityIndicator size="small" color={accent.accent} />
                        ) : (
                          <Text style={[styles.actionBtnFilledText, { color: accent.accent }]}>
                            {RIDE_TYPES.includes(order.serviceType) ? "Rebook" : order.__serviceKey === "delivery" ? "Repeat route" : "Order again"}
                          </Text>
                        )}
                      </TouchableOpacity>
                      {/* A cancelled order has no receipt to open — tracking bounces straight back home. */}
                      {!isCancelled && (isDelivered && !order.isReviewed ? (
                        <TouchableOpacity style={styles.actionBtnOutline} onPress={() => handleOpenReviewModal(order)}>
                          <Text style={styles.actionBtnOutlineText}>Rate</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.actionBtnOutline} onPress={() => router.push({ pathname: "/tracking", params: { orderId: order._id } })}>
                          <Text style={styles.actionBtnOutlineText}>Receipt</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <AppTabBar active="orders" />

      {/* Filter sheet */}
      <Modal visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetScrim} activeOpacity={1} onPress={() => setShowFilterSheet(false)} />
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.filterSheetTitle}>Filter orders</Text>
            <Text style={styles.sectionLabel}>Service</Text>
            <View style={{ gap: 8, marginBottom: 20 }}>
              {Object.entries(SERVICE_META).filter(([k]) => k !== "bike" && k !== "auto" && k !== "cab" && k !== "cab_prime").map(([key, meta]) => {
                const isSelected = pendingServiceFilters.has(key);
                const accent = tokens.services[meta.accent];
                const count = serviceCounts[key] || 0;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.filterOptionRow, isSelected && { borderColor: accent.accent, backgroundColor: accent.skin }]}
                    onPress={() => toggleServiceFilter(key)}
                  >
                    <View style={[styles.checkbox, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}>
                      {isSelected && <Ionicons name="checkmark" size={13} color={accent.on} />}
                    </View>
                    <Text style={styles.filterOptionLabel}>{meta.label}</Text>
                    <Text style={styles.filterOptionCount}>{count}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={styles.clearBtn} onPress={() => setPendingServiceFilters(new Set())}>
                <Text style={styles.clearBtnText}>Clear all</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.showBtn, { backgroundColor: tokens.brand }]} onPress={applyFilters}>
                <Text style={[styles.showBtnText, { color: tokens.onBrand }]}>Show {pendingCount} orders</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review modal */}
      <Modal visible={!!selectedOrderForReview} transparent animationType="fade" onRequestClose={() => setSelectedOrderForReview(null)}>
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={styles.reviewTitle}>Rate your order</Text>
              <TouchableOpacity onPress={() => setSelectedOrderForReview(null)}><Ionicons name="close" size={20} color={tokens.sec} /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={moderateScale(30)} color={tokens.warning} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 12 }}>
              {REVIEW_TAGS.map((tag) => {
                const isSelected = reviewTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.reviewTagChip, isSelected && { backgroundColor: tokens.brand, borderColor: tokens.brand }]}
                    onPress={() => setReviewTags((prev) => (isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]))}
                  >
                    <Text style={[styles.reviewTagText, isSelected && { color: tokens.onBrand }]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={styles.reviewInput} placeholder="Add feedback (optional)" placeholderTextColor={tokens.muted} value={reviewComment} onChangeText={setReviewComment} multiline />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16, width: "100%" }}>
              <TouchableOpacity style={styles.reviewCancelBtn} onPress={() => setSelectedOrderForReview(null)}>
                <Text style={styles.reviewCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.reviewSubmitBtn, { backgroundColor: tokens.brand }]} onPress={handleSubmitReview} disabled={submittingReview}>
                {submittingReview ? <ActivityIndicator size="small" color={tokens.onBrand} /> : <Text style={[styles.reviewSubmitBtnText, { color: tokens.onBrand }]}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 10 },
    headline: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(24), letterSpacing: -0.3, color: tokens.text },
    filterBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },

    chipsRow: { paddingHorizontal: 16, gap: 8 },
    chip: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, minHeight: 40 },
    chipActive: { backgroundColor: tokens.text, borderColor: tokens.text },
    chipText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: tokens.sec },
    chipTextActive: { color: tokens.bg },

    section: { paddingHorizontal: 16, paddingTop: 22 },
    sectionLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 10 },

    card: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 14 },
    cardEyebrow: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 1, textTransform: "uppercase" },
    cardTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(16), letterSpacing: -0.1, color: tokens.text, marginTop: 6 },
    cardMeta: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 4 },
    cardMetaRight: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.sec },

    liveRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    liveDot: { width: 8, height: 8, marginLeft: "auto", marginRight: 0 },
    liveDotCore: { width: 8, height: 8, borderRadius: 4 },
    liveLabel: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(12) },
    cancelledBadge: { backgroundColor: tokens.errorSkin, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    cancelledBadgeText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 0.5, textTransform: "uppercase", color: tokens.error },
    schedulePill: { marginLeft: "auto", backgroundColor: tokens.warningSkin, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    schedulePillText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 0.5, textTransform: "uppercase", color: tokens.warning },
    rejectionReason: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(12), lineHeight: moderateScale(18), color: tokens.error, marginTop: 6 },

    actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    actionBtnFilled: { flex: 1, borderWidth: 1, borderRadius: 10, minHeight: 40, alignItems: "center", justifyContent: "center" },
    actionBtnFilledText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13) },
    actionBtnOutline: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 10, minHeight: 40, alignItems: "center", justifyContent: "center" },
    actionBtnOutlineText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: tokens.sec },
    trackBtn: { marginTop: 12, borderRadius: 12, minHeight: 44, alignItems: "center", justifyContent: "center" },
    trackBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14) },

    skeletonCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 14 },
    skeletonBar: { backgroundColor: tokens.sunken, borderRadius: 6 },

    emptyWrap: { flex: 1, alignItems: "center", paddingTop: 100, paddingHorizontal: 32 },
    emptyIconCircle: { width: 72, height: 72, borderRadius: 24, backgroundColor: tokens.brandSkin, alignItems: "center", justifyContent: "center", marginBottom: 18 },
    emptyTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(22), letterSpacing: -0.2, color: tokens.text, textAlign: "center" },
    emptySubtitle: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(15), lineHeight: moderateScale(21), color: tokens.sec, textAlign: "center", marginTop: 10, marginBottom: 22 },
    primaryBtn: { width: "100%", borderRadius: 14, minHeight: moderateScale(48), alignItems: "center", justifyContent: "center" },
    primaryBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15) },

    sheetOverlay: { flex: 1, justifyContent: "flex-end" },
    sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: tokens.borderStrong, alignSelf: "center", marginBottom: 18 },
    filterSheet: { backgroundColor: tokens.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 24 },
    filterSheetTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(24), letterSpacing: -0.3, color: tokens.text, marginBottom: 18 },
    filterOptionRow: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 48 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: tokens.borderStrong, alignItems: "center", justifyContent: "center" },
    filterOptionLabel: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text },
    filterOptionCount: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec },
    clearBtn: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    clearBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.sec },
    showBtn: { flex: 1, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    showBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15) },

    reviewOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    reviewCard: { width: "100%", borderRadius: 18, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface, padding: 20 },
    reviewTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(18), color: tokens.text },
    reviewTagChip: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
    reviewTagText: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.text },
    reviewInput: { borderWidth: 1, borderColor: tokens.border, borderRadius: 12, padding: 12, minHeight: 60, fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), color: tokens.text, textAlignVertical: "top" },
    reviewCancelBtn: { flex: 1, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
    reviewCancelBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.sec },
    reviewSubmitBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
    reviewSubmitBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14) },
  });
