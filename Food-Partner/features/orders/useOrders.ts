import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePartnerTabBarHeight } from "@/components/PartnerTabBar";
import { useTokens } from "@/contexts/themeStore";
import { useOrderHistory, useVendorOrders } from "@/queries/orders.queries";
import { isActive, isCancelled, isCompleted, needsAction } from "@/utils/orderStatus";
import { mergeOrders } from "@/utils/orderWindow";
import { createStyles } from "./orders.styles";

export type OrdersFilter = "active" | "completed" | "cancelled";
const ORDER_FILTERS: OrdersFilter[] = ["active", "completed", "cancelled"];

/**
 * The Orders tab, split by where each order is in its life. Active comes from
 * the live set; Completed and Cancelled add the history before today, which
 * loads only once one of them is opened and then a page at a time on scroll.
 */
export function useOrders() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = usePartnerTabBarHeight();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(), []);
  const query = useVendorOrders();
  const [filter, setFilter] = useState<OrdersFilter>("active");
  // Opened from a dashboard card: start on the segment it points at. `at` is new
  // on every tap, so the same card works again after the partner switched segments.
  const params = useLocalSearchParams<{ filter?: string; at?: string }>();
  useEffect(() => {
    if (ORDER_FILTERS.includes(params.filter as OrdersFilter)) setFilter(params.filter as OrdersFilter);
  }, [params.filter, params.at]);
  const showsHistory = filter !== "active";
  const history = useOrderHistory({ enabled: showsHistory });
  const [refreshing, setRefreshing] = useState(false);
  const live = useMemo(() => query.data ?? [], [query.data]);
  const all = useMemo(() => mergeOrders(live, history.data?.pages.flat()), [live, history.data]);

  const groups = useMemo(() => {
    const active = live
      .filter((o) => isActive(o.status))
      // Orders the kitchen must act on first, then newest first.
      .sort((a, b) => Number(needsAction(b)) - Number(needsAction(a)));
    return {
      active,
      completed: all.filter((o) => isCompleted(o.status)),
      cancelled: all.filter((o) => isCancelled(o.status)),
    };
  }, [live, all]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([query.refetch(), showsHistory ? history.refetch() : null]);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (showsHistory && history.hasNextPage && !history.isFetchingNextPage) history.fetchNextPage().catch(() => {});
  };

  const visible = groups[filter];
  return {
    insets,
    tabBarHeight,
    tokens,
    styles,
    filter,
    setFilter,
    visible,
    counts: { active: groups.active.length, completed: groups.completed.length, cancelled: groups.cancelled.length },
    loading: query.isLoading || (showsHistory && history.isLoading),
    loadingMore: showsHistory && history.isFetchingNextPage,
    loadMore,
    error: (query.isError || (showsHistory && history.isError)) && visible.length === 0,
    refreshing,
    refresh,
  };
}
