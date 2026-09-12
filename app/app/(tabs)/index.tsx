import Animated from "react-native-reanimated";
import { StickyHeader } from "@/features/home/components/StickyHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useHome } from "@/features/home/useHome";
import { FlashList } from "@shopify/flash-list";
import { HomeListSection } from "@/features/home/components/HomeListSection";
import { HomeOverlays } from "@/features/home/components/HomeOverlays";
import { HomeFilterModal } from "@/features/home/components/HomeFilterModal";

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

      <HomeListSection
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
      <HomeOverlays {...home} />
      <HomeFilterModal {...home} />
    </ScreenShell>
  );
}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<any>);
