import { useMemo } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import i18n from "@/i18n";
import { customFetch } from "@/utils/api/custom-fetch";
import { useCartStore } from "@/contexts/cartStore";
import { useHomeStore } from "@/contexts/homeStore";
import { isScheduledOrder, isTerminalOrder, readOrderLines, toCartItem } from "./useOrders.shared";

// Part 2 of useOrders, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useOrdersScheduled(orders: any, setOrders: any, setReorderingId: any, selectedOrderForReview: any, setSelectedOrderForReview: any, reviewRating: any, setReviewRating: any, reviewComment: any, setReviewComment: any, reviewTags: any, setReviewTags: any, setSubmittingReview: any, withKey: any, filtered: any) {
  const scheduled = filtered.filter((o: any) => isScheduledOrder(o) && !isTerminalOrder(o));
  const active = filtered.filter((o: any) => !isScheduledOrder(o) && !isTerminalOrder(o));
  const past = filtered.filter((o: any) => isTerminalOrder(o));

  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    withKey.forEach((o: any) => { counts[o.__serviceKey] = (counts[o.__serviceKey] || 0) + 1; });
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
      setOrders((prev: any) => prev.map((o: any) => (o._id === selectedOrderForReview._id ? { ...o, isReviewed: true } : o)));
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
        Alert.alert(i18n.t("app.orders.cantReorder"), i18n.t("app.orders.weCouldntFindTheItemsFrom"));
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

  return { scheduled, active, past, serviceCounts, handleOpenReviewModal, handleSubmitReview, reorderIntoCart };
}
