import React, { useMemo, useState } from "react";
import { OrdersBody } from "@/features/orders/components/OrdersBody";
import { OrdersFilterSheet } from "@/features/orders/components/OrdersFilterSheet";
import { OrderReviewSheet } from "@/features/orders/components/OrderReviewSheet";
import { Alert, ScrollView, Text } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import Animated from "react-native-reanimated";
import { createStyles } from "@/features/orders/orders.styles";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useCartStore } from "@/contexts/cartStore";
import { useHomeStore } from "@/contexts/homeStore";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";

import { fadeInDown, fadeInUp } from "@/motion/presets";
import { OrdersSection } from "@/features/orders/components/OrdersSection";
import { OrdersSection2 } from "@/features/orders/components/OrdersSection2";
import { OrdersSection3 } from "@/features/orders/components/OrdersSection3";
import { OrdersEmptyWrap } from "@/features/orders/components/OrdersEmptyWrap";
import { OrdersChip } from "@/features/orders/components/OrdersChip";
import { OrdersChip2 } from "@/features/orders/components/OrdersChip2";
import { OrdersChip3 } from "@/features/orders/components/OrdersChip3";
import { ScreenShell } from "@/components/ui/ScreenShell";

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
    <ScreenShell>
      <Animated.View style={[styles.header, { paddingTop: insets.top + 14 }]} entering={fadeInDown(0)}>
        <Text style={styles.headline}>My orders</Text>
        <OrdersChip
          openFilterSheet={openFilterSheet}
          styles={styles}
          tokens={tokens}
        />
      </Animated.View>

      {loading ? (
        <OrdersBody
          styles={styles}
        />
      ) : isEmpty ? (
        <OrdersEmptyWrap
          orders={orders}
          styles={styles}
          tokens={tokens}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }} showsVerticalScrollIndicator={false}>
          <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} entering={fadeInUp(40)}>
            <OrdersChip3
              serviceFilters={serviceFilters}
              setServiceFilters={setServiceFilters}
              styles={styles}
            />
            {Object.entries(SERVICE_META).filter(([k]) => k !== "bike" && k !== "auto" && k !== "cab" && k !== "cab_prime").map(([key, meta]) => {
              const isActive = serviceFilters.has(key);
              return (
                <OrdersChip2
                  isActive={isActive}
                  key={key}
                  meta={meta}
                  setServiceFilters={setServiceFilters}
                  styles={styles}
                />
              );
            })}
          </Animated.ScrollView>

          {scheduled.length > 0 && (
            <OrdersSection
              SCHEDULE_PILL={SCHEDULE_PILL}
              SERVICE_META={SERVICE_META}
              scheduledSlot={scheduledSlot}
              scheduled={scheduled}
              styles={styles}
              tokens={tokens}
            />
          )}

          {active.length > 0 && (
            <OrdersSection2
              SERVICE_META={SERVICE_META}
              activeStatusCaption={activeStatusCaption}
              active={active}
              styles={styles}
              tokens={tokens}
            />
          )}

          {past.length > 0 && (
            <OrdersSection3
              RIDE_TYPES={RIDE_TYPES}
              SERVICE_META={SERVICE_META}
              handleOpenReviewModal={handleOpenReviewModal}
              handleReorder={handleReorder}
              past={past}
              reorderingId={reorderingId}
              styles={styles}
              tokens={tokens}
            />
          )}
        </ScrollView>
      )}

      <AppTabBar active="orders" />

      {/* Filter sheet */}
      <OrdersFilterSheet
        SERVICE_META={SERVICE_META}
        applyFilters={applyFilters}
        orders={orders}
        pendingCount={pendingCount}
        pendingServiceFilters={pendingServiceFilters}
        serviceCounts={serviceCounts}
        setPendingServiceFilters={setPendingServiceFilters}
        setShowFilterSheet={setShowFilterSheet}
        showFilterSheet={showFilterSheet}
        styles={styles}
        toggleServiceFilter={toggleServiceFilter}
        tokens={tokens}
      />

      {/* Review modal */}
      <OrderReviewSheet
        REVIEW_TAGS={REVIEW_TAGS}
        handleSubmitReview={handleSubmitReview}
        reviewComment={reviewComment}
        reviewRating={reviewRating}
        reviewTags={reviewTags}
        selectedOrderForReview={selectedOrderForReview}
        setReviewComment={setReviewComment}
        setReviewRating={setReviewRating}
        setReviewTags={setReviewTags}
        setSelectedOrderForReview={setSelectedOrderForReview}
        styles={styles}
        submittingReview={submittingReview}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
