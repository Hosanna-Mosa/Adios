import React, { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { createStyles } from "./orders.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { resolveServiceKey } from "./useOrders.shared";

// Part 1 of useOrders, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useOrdersInsets() {
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

  return { insets, tabBarHeight, tokens, styles, orders, setOrders, loading, serviceFilters, setServiceFilters, showFilterSheet, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters, reorderingId, setReorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating, reviewComment, setReviewComment, reviewTags, setReviewTags, submittingReview, setSubmittingReview, withKey, filtered };
}
