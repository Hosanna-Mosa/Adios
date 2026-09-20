import { Text, View, ActivityIndicator } from "react-native";
import Animated from "react-native-reanimated";
import { StickyHeader } from "@/features/home/components/StickyHeader";
import { EmptySearchState } from "@/features/home/components/EmptySearchState";
import { NoRidersState } from "@/features/home/components/NoRidersState";
import { DistanceSheet } from "@/features/home/components/DistanceSheet";
import { HomeSearchOverlay } from "@/features/home/components/HomeSearchOverlay";
import { HomeFilterModal } from "@/features/home/components/HomeFilterModal";
import { DishSearchResultItem } from "@/features/home/components/DishSearchResultItem";
import { HomeSkeletonCard } from "@/features/home/components/HomeSkeletonCard";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { AppTabBar } from "@/components/AppTabBar";
import { staggerListItem } from "@/motion/presets";
import { HomeNoServiceContainer } from "@/features/home/components/HomeNoServiceContainer";
import { HomeNoServiceContainer2 } from "@/features/home/components/HomeNoServiceContainer2";
import { HomeNoServiceContainer3 } from "@/features/home/components/HomeNoServiceContainer3";
import { HomeEmptySearchContainer } from "@/features/home/components/HomeEmptySearchContainer";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StartupAdModal } from "@/features/home/components/StartupAdModal";
import { useHome } from "@/features/home/useHome";
import { FlashList } from "@shopify/flash-list";
import { IndexSection } from "@/features/home/components/IndexSection";
import { IndexSection2 } from "@/features/home/components/IndexSection2";
import { IndexSection3 } from "@/features/home/components/IndexSection3";
import { IndexSection4 } from "@/features/home/components/IndexSection4";
import { IndexSection5 } from "@/features/home/components/IndexSection5";
import { IndexSection6 } from "@/features/home/components/IndexSection6";

export default function HomeScreen() {
  const home = useHome();
  const {
  accent, activeFilterCount, activeService, cartVendorName, checkNearbyDrivers, clearAllFilters,
  fetch149StoreItems, fetchMeatCenters, fetchVendors, getCoords, handleUseCurrentLocation,
  hasNoLocation, isRetryingDrivers, isSearching, isStickyVisible, keyboardHeight, listData,
  loadMore, loadingDrivers, loadingMore, nearbyDriversCount, onMainScroll, renderHeader,
  searchText, setHasMore, setIsRetryingDrivers, setPage, setSearchText, showHomeSkeleton, styles,
  tabBarHeight, tokens, visibleItems
  } = home;

  return (
    <ScreenShell>
      {isStickyVisible && (
        <StickyHeader {...home} />
      )}

      <IndexSection
        nearbyDriversCount={nearbyDriversCount}
        loadingDrivers={loadingDrivers}
        activeService={activeService}
        tabBarHeight={tabBarHeight}
        searchText={searchText}
        setSearchText={setSearchText}
        loadingMore={loadingMore}
        isRetryingDrivers={isRetryingDrivers}
        setIsRetryingDrivers={setIsRetryingDrivers}
        setPage={setPage}
        setHasMore={setHasMore}
        tokens={tokens}
        accent={accent}
        styles={styles}
        cartVendorName={cartVendorName}
        keyboardHeight={keyboardHeight}
        hasNoLocation={hasNoLocation}
        getCoords={getCoords}
        fetchVendors={fetchVendors}
        fetchMeatCenters={fetchMeatCenters}
        fetch149StoreItems={fetch149StoreItems}
        checkNearbyDrivers={checkNearbyDrivers}
        loadMore={loadMore}
        showHomeSkeleton={showHomeSkeleton}
        visibleItems={visibleItems}
        onMainScroll={onMainScroll}
        listData={listData}
        activeFilterCount={activeFilterCount}
        clearAllFilters={clearAllFilters}
        isSearching={isSearching}
        handleUseCurrentLocation={handleUseCurrentLocation}
        renderHeader={renderHeader}
        AnimatedFlashList={AnimatedFlashList}
      />
      <IndexSection5 {...home} />
      <IndexSection6 {...home} />
    </ScreenShell>
  );
}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<any>);
