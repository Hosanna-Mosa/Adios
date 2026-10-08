import React, { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { createStyles } from "./orders.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { resolveServiceKey } from "./useOrders.shared";
import { getOrders } from "@/services/orders.service";
import { usePolling } from "@/utils/usePolling";

// Split out of useOrders so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

/** Silent re-fetch while the tab is on screen, so finished orders drop their Track button. */
const POLL_MS = 15000;

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

  const [focused, setFocused] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
      setFocused(true);
      return () => setFocused(false);
    }, [fetchOrders])
  );

  usePolling(() => fetchOrders({ silent: true }), POLL_MS, { enabled: focused, immediate: false });

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
