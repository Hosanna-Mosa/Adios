import React, { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { createStyles } from "./orders.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { resolveServiceKey } from "./useOrders.shared";
import { getOrders } from "@/services/orders.service";
import { socketService } from "@/utils/socketService";

// Split out of useOrders so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useOrdersInsets() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [theme]);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceFilters, setServiceFilters] = useState<Set<string>>(new Set());
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [pendingServiceFilters, setPendingServiceFilters] = useState<Set<string>>(new Set());

  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      const data = await getOrders();
      if (data) setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  // A status change fires this into the customer's own socket room regardless
  // of which order it's for (see orders.service.ts#updateOrderStatus) — unlike
  // "order_status_update", which is scoped to whichever single order the
  // tracking screen currently has joined. Without this, a ride that finished
  // while the customer was already sitting on this tab kept its "Track order"
  // button until the next time the tab regained focus — nothing here told the
  // already-fetched list that anything had changed.
  React.useEffect(() => {
    socketService.connect();
    const onOrderListUpdate = () => fetchOrders({ silent: true });
    socketService.on("customer_order_list_update", onOrderListUpdate);
    return () => socketService.off("customer_order_list_update", onOrderListUpdate);
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders({ silent: true });
    setRefreshing(false);
  }, [fetchOrders]);

  const withKey = useMemo(() => orders.map((o) => ({ ...o, __serviceKey: resolveServiceKey(o) })), [orders]);
  const filtered = useMemo(
    () => (serviceFilters.size === 0 ? withKey : withKey.filter((o) => serviceFilters.has(o.__serviceKey))),
    [withKey, serviceFilters]
  );

  return { insets, tabBarHeight, tokens, styles, orders, setOrders, loading, refreshing, onRefresh, serviceFilters, setServiceFilters, showFilterSheet, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters, reorderingId, setReorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating, reviewComment, setReviewComment, reviewTags, setReviewTags, submittingReview, setSubmittingReview, withKey, filtered };
}
