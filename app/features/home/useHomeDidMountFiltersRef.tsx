import { useEffect, useMemo, useRef } from "react";
import { useHomeStore } from "@/contexts/homeStore";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeDidMountFiltersRef(loading: any, setLoading: any, loadingDrivers: any, loadingMore: any, page: any, setPage: any, setHasMore: any, setIsDistanceSheetOpen: any, setDistanceOption: any, setCustomDistance: any, setAppliedDistanceKm: any, setDistanceRefreshKey: any, searchedDishes: any, serverFilterKey: any, applyDistanceFilter: any) {
  // Rating, open-now, ordering and search are server-side now, so each change needs
  // a fresh page 1. The main fetch effect early-returns on its cached-coords guard,
  // so drop that cache first — the same nudge applyDistanceFilter uses.
  const didMountFiltersRef = useRef(false);
  useEffect(() => {
    if (!didMountFiltersRef.current) {
      didMountFiltersRef.current = true;
      return;
    }
    useHomeStore.setState({ lastFetchedCoords: null });
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setDistanceRefreshKey((value: any) => value + 1);
  }, [serverFilterKey]);

  const clearDistanceFilter = () => {
    setDistanceOption("5");
    setCustomDistance("");
    setAppliedDistanceKm(null);
    useHomeStore.setState({ lastFetchedCoords: null });
    setLoading(true);
    setDistanceRefreshKey((value: any) => value + 1);
    setIsDistanceSheetOpen(false);
  };

  const showHomeSkeleton = (loading && !loadingMore) || loadingDrivers;

  // Every restaurant that serves one of the matched dishes, so a dish word also
  // surfaces its outlet even when the outlet's own text says nothing about it.
  const dishVendorIds = useMemo(
    () =>
      new Set(
        searchedDishes
          .map((dish: any) => (dish?.vendorId && typeof dish.vendorId === "object" ? dish.vendorId._id : dish?.vendorId))
          .filter(Boolean)
          .map(String)
      ),
    [searchedDishes]
  );

  return { clearDistanceFilter, showHomeSkeleton, dishVendorIds };
}
