import { useEffect, useMemo, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QuickFilter } from "./useMeatCenters.shared";

// Part 2 of useMeatCenters, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useMeatCentersQuickFilterKey(loading: any, loadingMore: any, page: any, setPage: any, hasMore: any, setHasMore: any, selectedAddress: any, setSelectedAddress: any, selectedCategory: any, activeQuickFilters: any, setActiveQuickFilters: any, getCoords: any, fetchMeatCenters: any) {
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const activeStr = await AsyncStorage.getItem("active_address");
          if (activeStr) setSelectedAddress(JSON.parse(activeStr));
        } catch (e) {
          console.error("Failed to load active address:", e);
        }
      })();
    }, [])
  );

  // Set identity changes on every toggle, so key the refetch on the contents.
  const quickFilterKey = useMemo(() => Array.from(activeQuickFilters).sort().join(","), [activeQuickFilters]);

  useEffect(() => {
    (async () => {
      setPage(1);
      setHasMore(true);
      const { lat, lng } = await getCoords();
      fetchMeatCenters(lat, lng, 1, selectedCategory);
    })();
  }, [selectedAddress, selectedCategory, quickFilterKey]);

  const loadMore = async () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      const { lat, lng } = await getCoords();
      fetchMeatCenters(lat, lng, nextPage, selectedCategory);
    }
  };

  const toggleQuickFilter = (key: QuickFilter) => {
    setActiveQuickFilters((prev: any) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return { loadMore, toggleQuickFilter };
}
