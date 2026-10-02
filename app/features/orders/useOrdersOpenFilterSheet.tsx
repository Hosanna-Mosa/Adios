import { useMemo } from "react";
import { toggleChipKeys } from "./useOrders.shared";

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
  // Takes the whole key group behind a chip — "Ride" stands for four service types.
  const toggleServiceFilter = (keys: string[]) => {
    setPendingServiceFilters((prev: any) => toggleChipKeys(prev, keys));
  };
  const pendingCount = useMemo(() => {
    if (pendingServiceFilters.size === 0) return withKey.length;
    return withKey.filter((o: any) => pendingServiceFilters.has(o.__serviceKey)).length;
  }, [withKey, pendingServiceFilters]);

  const isEmpty = !loading && orders.length === 0;

  return { openFilterSheet, applyFilters, toggleServiceFilter, pendingCount, isEmpty };
}
