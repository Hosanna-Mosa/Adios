import { useMemo } from "react";

// Split out of useOrders so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

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
