import AsyncStorage from "@react-native-async-storage/async-storage";
import { HomeBody } from "./components/HomeBody";

// Part 12 of useHome, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHomeIsSearching(restaurants: any, nearbyDriversCount: any, loading: any, loadingDrivers: any, store149Items: any, activeService: any, insets: any, searchText: any, searchQuery: any, appliedSearchTerm: any, setIsSearchActive: any, carouselRef: any, bannerScrollX: any, bannerIndexRef: any, onBannerScroll: any, tokens: any, accent: any, styles: any, searchBarAnimatedStyle: any, setSelectedAddress: any, setIsDistanceSheetOpen: any, appliedDistanceKm: any, setDistanceRefreshKey: any, isSearchingDishes: any, filterFastDelivery: any, setFilterFastDelivery: any, filterOffers: any, setFilterOffers: any, filterMinRating: any, setFilterMinRating: any, filterOpenNow: any, setFilterOpenNow: any, filterCostRange: any, setFilterCostRange: any, filterVegNonVeg: any, setFilterVegNonVeg: any, selectedCuisines: any, setSelectedCuisines: any, setActiveFilterTab: any, setIsFilterModalVisible: any, handleServiceSwitch: any, showHomeSkeleton: any, visibleItems: any, filteredAndSortedItems: any, cuisineChips: any, showCategories: any, greetingAds: any, promoCards: any, areaLabel: any, areaLine: any, activeFilterCount: any) {
  // True while the debounce or either search request is still in flight — the
  // window in which the list used to claim "No results found" prematurely.
  const isSearching =
    searchText.trim().length > 0 &&
    (searchQuery !== searchText.trim() ||
      isSearchingDishes ||
      // /meat/nearby has no search parameter, so only the Food list waits on a refetch.
      (activeService !== "Meat" && appliedSearchTerm !== searchQuery));

  // Re-attempts GPS from scratch: drops any saved address and the cached
  // "user denied GPS" flag, then nudges the address-loading effect to re-run.
  const handleUseCurrentLocation = async () => {
    try {
      await AsyncStorage.removeItem("gps_permission_denied");
      await AsyncStorage.removeItem("active_address");
    } catch (e) {
      console.error("Failed to reset location prefs:", e);
    }
    setSelectedAddress(null);
    setDistanceRefreshKey((v: any) => v + 1);
  };

  const renderHeader = () => {
    const hasRidersButNoVendors = !showHomeSkeleton && !loadingDrivers && (nearbyDriversCount ?? 0) > 0 && visibleItems.length === 0;
    if (!showCategories || ((!showHomeSkeleton && visibleItems.length === 0) && !hasRidersButNoVendors)) return null;

    return (
      <HomeBody
        hasRidersButNoVendors={hasRidersButNoVendors}
        accent={accent}
        activeFilterCount={activeFilterCount}
        activeService={activeService}
        appliedDistanceKm={appliedDistanceKm}
        areaLabel={areaLabel}
        areaLine={areaLine}
        bannerIndexRef={bannerIndexRef}
        bannerScrollX={bannerScrollX}
        carouselRef={carouselRef}
        cuisineChips={cuisineChips}
        filterCostRange={filterCostRange}
        filterFastDelivery={filterFastDelivery}
        filterMinRating={filterMinRating}
        filterOffers={filterOffers}
        filterOpenNow={filterOpenNow}
        filterVegNonVeg={filterVegNonVeg}
        filteredAndSortedItems={filteredAndSortedItems}
        greetingAds={greetingAds}
        handleServiceSwitch={handleServiceSwitch}
        insets={insets}
        onBannerScroll={onBannerScroll}
        promoCards={promoCards}
        restaurants={restaurants}
        searchBarAnimatedStyle={searchBarAnimatedStyle}
        selectedCuisines={selectedCuisines}
        setActiveFilterTab={setActiveFilterTab}
        setFilterCostRange={setFilterCostRange}
        setFilterFastDelivery={setFilterFastDelivery}
        setFilterMinRating={setFilterMinRating}
        setFilterOffers={setFilterOffers}
        setFilterOpenNow={setFilterOpenNow}
        setFilterVegNonVeg={setFilterVegNonVeg}
        setIsDistanceSheetOpen={setIsDistanceSheetOpen}
        setIsFilterModalVisible={setIsFilterModalVisible}
        setIsSearchActive={setIsSearchActive}
        setSelectedCuisines={setSelectedCuisines}
        store149Items={store149Items}
        styles={styles}
        tokens={tokens}
      />
    );
  };

  return { isSearching, handleUseCurrentLocation, renderHeader };
}
