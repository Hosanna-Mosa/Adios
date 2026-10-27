import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { DriverOrder, OrderScope } from "../types";

const PAGE_SIZE = 20;

/** One page-at-a-time list of the driver's ongoing or past orders. Reloads whenever the screen is focused. */
export function useDriverOrders(scope: OrderScope) {
  const token = useDriverStore((s) => s.token);
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const page = useRef(1);
  // A slow response for the tab the driver just left must not overwrite the new one.
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (nextPage: number) => {
      const res = await fetch(
        `${apiUrl}/orders/driver/orders?scope=${scope}&page=${nextPage}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      return data as { orders: DriverOrder[]; hasMore: boolean };
    },
    [scope, token],
  );

  const load = useCallback(
    async (refreshing = false) => {
      if (!apiUrl || !token) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      const id = ++requestId.current;
      refreshing ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const data = await fetchPage(1);
        if (id !== requestId.current) return;
        page.current = 1;
        setOrders(data.orders);
        setHasMore(data.hasMore);
        setError(null);
      } catch (e: any) {
        if (id === requestId.current) setError(e.message || "Failed to load orders");
      } finally {
        if (id === requestId.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [fetchPage, token],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    const id = requestId.current;
    setIsLoadingMore(true);
    try {
      const data = await fetchPage(page.current + 1);
      if (id !== requestId.current) return;
      page.current += 1;
      setOrders((prev) => {
        const seen = new Set(prev.map((o) => o._id));
        return [...prev, ...data.orders.filter((o) => !seen.has(o._id))];
      });
      setHasMore(data.hasMore);
    } catch {
      // Keep what is on screen; pulling to refresh retries.
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPage, hasMore, isLoadingMore, isLoading]);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  return { orders, isLoading, isRefreshing, isLoadingMore, hasMore, error, refresh: () => load(true), loadMore };
}
