import { useMemo } from "react";
import { runOnJS, useAnimatedScrollHandler } from "react-native-reanimated";
import { useHomeStore } from "@/contexts/homeStore";
import { HOME_SKELETON_ITEMS } from "./useHome.shared";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeOnMainScroll(restaurants: any, nearbyDriversCount: any, loadingDrivers: any, searchText: any, selectedAddress: any, setDistanceOption: any, setCustomDistance: any, appliedDistanceKm: any, setAppliedDistanceKm: any, searchedDishes: any, selectedSort: any, setSelectedSort: any, filter99Store: any, setFilter99Store: any, filterFastDelivery: any, setFilterFastDelivery: any, filterOffers: any, setFilterOffers: any, filterMinRating: any, setFilterMinRating: any, filterOpenNow: any, setFilterOpenNow: any, filterCostRange: any, setFilterCostRange: any, filterVegNonVeg: any, setFilterVegNonVeg: any, selectedCuisines: any, setSelectedCuisines: any, showHomeSkeleton: any, filteredAndSortedItems: any, scrollY: any, isStickyVisibleShared: any, setIsStickyVisible: any) {
  const onMainScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
    const visible = event.contentOffset.y >= 330;
    if (visible !== isStickyVisibleShared.value) {
      isStickyVisibleShared.value = visible;
      runOnJS(setIsStickyVisible)(visible);
    }
  });

  const listData = useMemo(() => {
    if (showHomeSkeleton) return HOME_SKELETON_ITEMS.map((item) => ({ ...item, isSkeleton: true }));
    if (!loadingDrivers && nearbyDriversCount === 0) return [];
    if (!searchText) return filteredAndSortedItems.map((item: any) => ({ ...item, isRestaurant: true }));

    const items: any[] = [];
    if (filteredAndSortedItems.length > 0) {
      items.push({ _id: "header-restaurants", isHeader: true, title: "RESTAURANTS" });
      filteredAndSortedItems.forEach((r: any) => items.push({ ...r, isRestaurant: true }));
    }
    if (searchedDishes.length > 0) {
      items.push({ _id: "header-dishes", isHeader: true, title: "DISHES & FOOD ITEMS" });
      searchedDishes.forEach((d: any) => items.push({ ...d, isDish: true }));
    }
    return items;
  }, [showHomeSkeleton, searchText, filteredAndSortedItems, searchedDishes, loadingDrivers, nearbyDriversCount]);

  const areaLabel = selectedAddress?.label && selectedAddress.label !== "Other" ? selectedAddress.label : "Home";
  const areaLine = selectedAddress?.addressLine || selectedAddress?.city || "your area";

  const activeFilterCount = [
    filter99Store, filterFastDelivery, filterOffers, filterMinRating > 0, filterOpenNow,
    filterCostRange !== "all", filterVegNonVeg !== "all", selectedCuisines.length > 0,
    appliedDistanceKm !== null, selectedSort !== "relevance",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedSort("relevance");
    setFilter99Store(false);
    setFilterFastDelivery(false);
    setFilterOffers(false);
    setFilterMinRating(0);
    setFilterOpenNow(false);
    setFilterCostRange("all");
    setFilterVegNonVeg("all");
    setSelectedCuisines([]);
    setDistanceOption("5");
    setCustomDistance("");
    setAppliedDistanceKm(null);
    // Radius and the server-side filters are cached against these coords, so drop
    // the cache or the refetch would be swallowed by the guard in the fetch effect.
    useHomeStore.setState({ lastFetchedCoords: null });
  };

  return { onMainScroll, listData, areaLabel, areaLine, activeFilterCount, clearAllFilters };
}
