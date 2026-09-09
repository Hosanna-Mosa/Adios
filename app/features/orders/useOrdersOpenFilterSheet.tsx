import { useMemo } from "react";

// Part 4 of useOrders, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useOrdersOpenFilterSheet(orders: any, loading: any, serviceFilters: any, setServiceFilters: any, setShowFilterSheet: any, pendingServiceFilters: any, setPendingServiceFilters: any, withKey: any) {
  const openFilterSheet = () => {
    setPendingServiceFilters(new Set(serviceFilters));
    setShowFilterSheet(true);
  };
  const applyFilters = () => {
    setServiceFilters(new Set(pendingServiceFilters));
    setShowFilterSheet(false);
  };
  const toggleServiceFilter = (key: string) => {
    setPendingServiceFilters((prev: any) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const pendingCount = useMemo(() => {
    if (pendingServiceFilters.size === 0) return withKey.length;
    return withKey.filter((o: any) => pendingServiceFilters.has(o.__serviceKey)).length;
  }, [withKey, pendingServiceFilters]);

  const isEmpty = !loading && orders.length === 0;

  return { openFilterSheet, applyFilters, toggleServiceFilter, pendingCount, isEmpty };
}
