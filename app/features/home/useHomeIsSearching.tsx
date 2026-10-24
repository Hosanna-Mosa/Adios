import AsyncStorage from "@react-native-async-storage/async-storage";
import { HomeBody } from "./components/HomeBody";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HomeStyles } from "./home.styles";
import type { SetState, HomeService } from "./useHome.shared";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeIsSearching(restaurants: any[], nearbyDriversCount: number | null, loading: boolean, loadingDrivers: boolean, store149Items: any[], activeService: HomeService, insets: EdgeInsets, searchText: string, searchQuery: string, appliedSearchTerm: string, setIsSearchActive: SetState<boolean>, carouselRef: any, bannerScrollX: any, bannerIndexRef: any, onBannerScroll: any, tokens: ThemeTokens, accent: ServiceTokens, styles: HomeStyles, searchBarAnimatedStyle: any, setSelectedAddress: any, setIsDistanceSheetOpen: SetState<boolean>, appliedDistanceKm: number | null, setDistanceRefreshKey: SetState<number>, isSearchingDishes: boolean, filterFastDelivery: boolean, setFilterFastDelivery: SetState<boolean>, filterOffers: boolean, setFilterOffers: SetState<boolean>, filterMinRating: number, setFilterMinRating: SetState<number>, filterOpenNow: boolean, setFilterOpenNow: SetState<boolean>, filterCostRange: string, setFilterCostRange: SetState<string>, filterVegNonVeg: string, setFilterVegNonVeg: SetState<string>, selectedCuisines: string[], setSelectedCuisines: SetState<string[]>, setActiveFilterTab: SetState<string>, setIsFilterModalVisible: SetState<boolean>, handleServiceSwitch: any, showHomeSkeleton: boolean, visibleItems: any[], filteredAndSortedItems: any[], cuisineChips: any[], showCategories: boolean, noRidersNearby: boolean, greetingAds: any[], promoCards: any[], areaLabel: string, areaLine: string, activeFilterCount: number, loadingFlags: { bannersLoading: boolean; store149Loading: boolean; cuisinesLoading: boolean }) {
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

  const hasRidersButNoVendors = !showHomeSkeleton && !loadingDrivers && (nearbyDriversCount ?? 0) > 0 && visibleItems.length === 0;
  const shouldShowHeader = showCategories && !((!showHomeSkeleton && visibleItems.length === 0) && !hasRidersButNoVendors && !noRidersNearby);

  // A plain element, computed once per render — not a function that builds one. FlashList's
  // ListHeaderComponent treats a *function* value as the header's component type, so a fresh
  // inline closure every render (as this used to be) reads to React as "the header's type just
  // changed", tearing the whole subtree down and remounting it. That replayed every entrance
  // animation and re-faded every image in on any unrelated state change while scrolling, which
  // is what looked like the banner and ₹149 photos "shrinking". An element keeps the same
  // underlying type (HomeBody) across renders, so React updates it in place instead.
  const renderHeader = shouldShowHeader ? (
      <HomeBody
        hasRidersButNoVendors={hasRidersButNoVendors}
        noRidersNearby={noRidersNearby}
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
        bannersLoading={loadingFlags.bannersLoading}
        store149Loading={loadingFlags.store149Loading}
        cuisinesLoading={loadingFlags.cuisinesLoading}
      />
    ) : null;

  return { isSearching, handleUseCurrentLocation, renderHeader };
}
