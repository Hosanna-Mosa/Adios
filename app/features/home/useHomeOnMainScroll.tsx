import { useMemo } from "react";
import { runOnJS, useAnimatedScrollHandler } from "react-native-reanimated";
import { useHomeStore } from "@/contexts/homeStore";
import { HOME_SKELETON_ITEMS } from "./useHome.shared";
import type { SetState, DistanceOption, SharedValue } from "./useHome.shared";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeOnMainScroll(restaurants: any[], nearbyDriversCount: number | null, loadingDrivers: boolean, searchText: string, selectedAddress: any, setDistanceOption: SetState<DistanceOption>, setCustomDistance: SetState<string>, appliedDistanceKm: number | null, setAppliedDistanceKm: SetState<number | null>, searchedDishes: any[], selectedSort: string, setSelectedSort: SetState<string>, filter99Store: boolean, setFilter99Store: SetState<boolean>, filterFastDelivery: boolean, setFilterFastDelivery: SetState<boolean>, filterOffers: boolean, setFilterOffers: SetState<boolean>, filterMinRating: number, setFilterMinRating: SetState<number>, filterOpenNow: boolean, setFilterOpenNow: SetState<boolean>, filterCostRange: string, setFilterCostRange: SetState<string>, filterVegNonVeg: string, setFilterVegNonVeg: SetState<string>, selectedCuisines: string[], setSelectedCuisines: SetState<string[]>, showHomeSkeleton: boolean, filteredAndSortedItems: any[], scrollY: SharedValue<number>, isStickyVisibleShared: SharedValue<boolean>, setIsStickyVisible: SetState<boolean>) {
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

    // The "no riders nearby" empty state only makes sense for the default browse
    // recommendations — it must not also swallow an active search. nearbyDriversCount
    // comes from a tight 5km driver-proximity check, while restaurant/dish search looks
    // as far as 15km; a customer with no driver within 5km but a real, matching
    // restaurant at 10km would otherwise see an empty list for a search that actually
    // found something, which reads as "the restaurant isn't there" when it is.
    if (!searchText) {
      if (!loadingDrivers && nearbyDriversCount === 0) return [];
      return filteredAndSortedItems.map((item: any) => ({ ...item, isRestaurant: true }));
    }

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
