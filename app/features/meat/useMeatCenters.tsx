import { useMeatCentersInsets } from "./useMeatCentersInsets";
import { useMeatCentersQuickFilterKey } from "./useMeatCentersQuickFilterKey";
import { useMeatCentersVisibleCenters } from "./useMeatCentersVisibleCenters";

// State, data loading and handlers for app/meat-centers.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useMeatCenters() {
  const { insets, tokens, accent, styles, loading, loadingMore, page, setPage, hasMore, setHasMore, meatCenters, selectedAddress, setSelectedAddress, selectedCategory, setSelectedCategory, activeQuickFilters, setActiveQuickFilters, searchOpen, setSearchOpen, searchText, setSearchText, getCoords, fetchMeatCenters } = useMeatCentersInsets();
  const { loadMore, toggleQuickFilter } = useMeatCentersQuickFilterKey(loading, loadingMore, page, setPage, hasMore, setHasMore, selectedAddress, setSelectedAddress, selectedCategory, activeQuickFilters, setActiveQuickFilters, getCoords, fetchMeatCenters);
  const { visibleCenters, renderHeader } = useMeatCentersVisibleCenters(tokens, accent, styles, meatCenters, selectedCategory, setSelectedCategory, activeQuickFilters, searchOpen, searchText, setSearchText, toggleQuickFilter);

  return {
  insets, tokens, accent, styles, loading, loadingMore, setPage, setHasMore, meatCenters,
  selectedAddress, selectedCategory, searchOpen, setSearchOpen, getCoords, fetchMeatCenters,
  loadMore, visibleCenters, renderHeader
  };
}

