import { useHomeRestaurants } from "./useHomeRestaurants";
import { useHomeSearchSheetAnimatedStyle } from "./useHomeSearchSheetAnimatedStyle";
import { useHomeClearRecentSearches } from "./useHomeClearRecentSearches";
import { useHomeToken } from "./useHomeToken";
import { useHomePart5 } from "./useHomePart5";
import { useHomeGetCoords } from "./useHomeGetCoords";
import { useHomeSelectedDistanceKm } from "./useHomeSelectedDistanceKm";
import { useHomeDidMountFiltersRef } from "./useHomeDidMountFiltersRef";
import { useHomeIsServerSearched } from "./useHomeIsServerSearched";
import { useHomeAvailableCuisines } from "./useHomeAvailableCuisines";
import { useHomeOnMainScroll } from "./useHomeOnMainScroll";
import { useHomeIsSearching } from "./useHomeIsSearching";

// State, data loading and handlers for app/(tabs)/index.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

// Maps the short quick-search tags to the actual query terms the backend
// dish-search endpoint expects.

export function useHome() {
  const { restaurants, setRestaurants, meatCenters, setMeatCenters, nearbyDriversCount, setNearbyDriversCount, loading, setLoading, loadingDrivers, setLoadingDrivers, store149Items, setStore149Items, activeService, setActiveService, insets, tabBarHeight, searchText, setSearchText, searchQuery, setSearchQuery, appliedSearchTerm, setAppliedSearchTerm, setIsSearchActive, isSearchVisible, searchTranslateY, searchBackdropOpacity, recentSearches, setRecentSearches } = useHomeRestaurants();
  const { searchSheetAnimatedStyle, searchBackdropAnimatedStyle, banners, setBanners, hasShownStartupAd, setHasShownStartupAd, activeStartupAd, setActiveStartupAd, carouselRef, bannerScrollX, bannerIndexRef, onBannerScroll, addRecentSearch } = useHomeSearchSheetAnimatedStyle(searchTranslateY, searchBackdropOpacity, recentSearches, setRecentSearches);
  const { clearRecentSearches, loadingMore, setLoadingMore, isRetryingDrivers, setIsRetryingDrivers, page, setPage, hasMore, setHasMore, tokens, accent, styles, cartVendorName, keyboardHeight, searchBarAnimatedStyle } = useHomeClearRecentSearches(restaurants, meatCenters, activeService, setRecentSearches);
  const { token, selectedAddress, setSelectedAddress, isAddressLoaded, setIsAddressLoaded, hasNoLocation, setHasNoLocation, addressResolveRef, hasRedirectedRef, isDistanceSheetOpen, setIsDistanceSheetOpen, distanceOption, setDistanceOption, customDistance, setCustomDistance, appliedDistanceKm, setAppliedDistanceKm, distanceRefreshKey, setDistanceRefreshKey, searchedDishes, setSearchedDishes, isSearchingDishes, setIsSearchingDishes, setLoading149, selectedSort, setSelectedSort, filter99Store, setFilter99Store, filterFastDelivery, setFilterFastDelivery, filterOffers, setFilterOffers, filterMinRating, setFilterMinRating, filterOpenNow, setFilterOpenNow, filterCostRange, setFilterCostRange, filterVegNonVeg, setFilterVegNonVeg, selectedCuisines, setSelectedCuisines, activeFilterTab, setActiveFilterTab, isFilterModalVisible, setIsFilterModalVisible } = useHomeToken(searchText, setSearchQuery);
  const {  } = useHomePart5(searchQuery, banners, setBanners, hasShownStartupAd, setHasShownStartupAd, setActiveStartupAd, setSelectedAddress, setIsAddressLoaded, setSearchedDishes, setIsSearchingDishes);
  const { getCoords } = useHomeGetCoords(selectedAddress);
  const { serverFilterKey, fetchVendors, fetchMeatCenters, fetch149StoreItems, checkNearbyDrivers, loadMore, handleServiceSwitch, applyDistanceFilter } = useHomeSelectedDistanceKm(setRestaurants, setMeatCenters, setNearbyDriversCount, loading, setLoading, loadingDrivers, setLoadingDrivers, setStore149Items, activeService, setActiveService, searchQuery, setAppliedSearchTerm, loadingMore, setLoadingMore, isRetryingDrivers, page, setPage, hasMore, setHasMore, token, selectedAddress, isAddressLoaded, setHasNoLocation, addressResolveRef, hasRedirectedRef, setIsDistanceSheetOpen, distanceOption, customDistance, appliedDistanceKm, setAppliedDistanceKm, distanceRefreshKey, setDistanceRefreshKey, setLoading149, selectedSort, filterMinRating, filterOpenNow, getCoords);
  const { clearDistanceFilter, showHomeSkeleton, dishVendorIds } = useHomeDidMountFiltersRef(loading, setLoading, loadingDrivers, loadingMore, page, setPage, setHasMore, setIsDistanceSheetOpen, setDistanceOption, setCustomDistance, setAppliedDistanceKm, setDistanceRefreshKey, searchedDishes, serverFilterKey, applyDistanceFilter);
  const { visibleItems, filteredAndSortedItems } = useHomeIsServerSearched(restaurants, meatCenters, store149Items, activeService, searchText, searchQuery, appliedSearchTerm, selectedSort, filter99Store, filterFastDelivery, filterOffers, filterMinRating, filterOpenNow, filterCostRange, filterVegNonVeg, selectedCuisines, dishVendorIds);
  const { availableCuisines, cuisineChips, showCategories, noRidersNearby, greetingAds, promoCards, scrollY, isStickyVisibleShared, isStickyVisible, setIsStickyVisible, stickyHeaderAnimatedStyle } = useHomeAvailableCuisines(restaurants, meatCenters, nearbyDriversCount, loadingDrivers, activeService, banners, carouselRef, bannerIndexRef, hasNoLocation, showHomeSkeleton, visibleItems);
  const { onMainScroll, listData, areaLabel, areaLine, activeFilterCount, clearAllFilters } = useHomeOnMainScroll(restaurants, nearbyDriversCount, loadingDrivers, searchText, selectedAddress, setDistanceOption, setCustomDistance, appliedDistanceKm, setAppliedDistanceKm, searchedDishes, selectedSort, setSelectedSort, filter99Store, setFilter99Store, filterFastDelivery, setFilterFastDelivery, filterOffers, setFilterOffers, filterMinRating, setFilterMinRating, filterOpenNow, setFilterOpenNow, filterCostRange, setFilterCostRange, filterVegNonVeg, setFilterVegNonVeg, selectedCuisines, setSelectedCuisines, showHomeSkeleton, filteredAndSortedItems, scrollY, isStickyVisibleShared, setIsStickyVisible);
  const { isSearching, handleUseCurrentLocation, renderHeader } = useHomeIsSearching(restaurants, nearbyDriversCount, loading, loadingDrivers, store149Items, activeService, insets, searchText, searchQuery, appliedSearchTerm, setIsSearchActive, carouselRef, bannerScrollX, bannerIndexRef, onBannerScroll, tokens, accent, styles, searchBarAnimatedStyle, setSelectedAddress, setIsDistanceSheetOpen, appliedDistanceKm, setDistanceRefreshKey, isSearchingDishes, filterFastDelivery, setFilterFastDelivery, filterOffers, setFilterOffers, filterMinRating, setFilterMinRating, filterOpenNow, setFilterOpenNow, filterCostRange, setFilterCostRange, filterVegNonVeg, setFilterVegNonVeg, selectedCuisines, setSelectedCuisines, setActiveFilterTab, setIsFilterModalVisible, handleServiceSwitch, showHomeSkeleton, visibleItems, filteredAndSortedItems, cuisineChips, showCategories, noRidersNearby, greetingAds, promoCards, areaLabel, areaLine, activeFilterCount);

  return {
  nearbyDriversCount, loadingDrivers, activeService, insets, tabBarHeight, searchText,
  setSearchText, setIsSearchActive, isSearchVisible, searchTranslateY, searchBackdropOpacity,
  recentSearches, searchSheetAnimatedStyle, searchBackdropAnimatedStyle, hasShownStartupAd,
  activeStartupAd, setActiveStartupAd, addRecentSearch, clearRecentSearches, loadingMore,
  isRetryingDrivers, setIsRetryingDrivers, setPage, setHasMore, tokens, accent, styles,
  cartVendorName, keyboardHeight, hasNoLocation, isDistanceSheetOpen, setIsDistanceSheetOpen,
  distanceOption, setDistanceOption, customDistance, setCustomDistance, appliedDistanceKm,
  selectedSort, setSelectedSort, filter99Store, setFilter99Store, filterFastDelivery,
  setFilterFastDelivery, filterOffers, setFilterOffers, filterMinRating, setFilterMinRating,
  filterOpenNow, setFilterOpenNow, filterCostRange, setFilterCostRange, filterVegNonVeg,
  setFilterVegNonVeg, selectedCuisines, setSelectedCuisines, activeFilterTab, setActiveFilterTab,
  isFilterModalVisible, setIsFilterModalVisible, getCoords, fetchVendors, fetchMeatCenters,
  fetch149StoreItems, checkNearbyDrivers, loadMore, handleServiceSwitch, applyDistanceFilter,
  clearDistanceFilter, showHomeSkeleton, visibleItems, filteredAndSortedItems, availableCuisines,
  isStickyVisible, stickyHeaderAnimatedStyle, onMainScroll, listData, areaLabel,
  activeFilterCount, clearAllFilters, isSearching, handleUseCurrentLocation, renderHeader
  };
}

