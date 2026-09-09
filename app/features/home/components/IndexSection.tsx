import { ActivityIndicator, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { EmptySearchState } from "@/features/home/components/EmptySearchState";
import { NoRidersState } from "@/features/home/components/NoRidersState";
import { DishSearchResultItem } from "@/features/home/components/DishSearchResultItem";
import { HomeSkeletonCard } from "@/features/home/components/HomeSkeletonCard";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { AppTabBar } from "@/components/AppTabBar";
import { staggerListItem } from "@/motion/presets";
import { HomeNoServiceContainer } from "@/features/home/components/HomeNoServiceContainer";
import { HomeNoServiceContainer2 } from "@/features/home/components/HomeNoServiceContainer2";
import { HomeNoServiceContainer3 } from "@/features/home/components/HomeNoServiceContainer3";
import { HomeEmptySearchContainer } from "@/features/home/components/HomeEmptySearchContainer";
import { buildHomeListRenderItem } from "./HomeListRenderItem";

// Markup moved out of (tabs)/index.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

import type { Props } from "./IndexSection.props";

export function IndexSection(props: Props) {
  const { nearbyDriversCount, loadingDrivers, activeService, tabBarHeight, searchText,
  setSearchText, loadingMore, isRetryingDrivers, setIsRetryingDrivers, setPage, setHasMore,
  tokens, accent, styles, cartVendorName, keyboardHeight, hasNoLocation, getCoords, fetchVendors,
  fetchMeatCenters, fetch149StoreItems, checkNearbyDrivers, loadMore, showHomeSkeleton,
  visibleItems, onMainScroll, listData, activeFilterCount, clearAllFilters, isSearching,
  handleUseCurrentLocation, renderHeader, AnimatedFlashList } = props;
  return (
    <>
    <AnimatedFlashList
      data={listData}
      keyExtractor={(item: any) => item._id}
      getItemType={(item: any) => (item.isSkeleton ? "skeleton" : item.isHeader ? "header" : item.isDish ? "dish" : "restaurant")}
      renderItem={buildHomeListRenderItem(accent, activeService, styles, tokens)}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={() => {
        if (showHomeSkeleton || loadingDrivers) return null;

        if (hasNoLocation) {
          return (
            <NoRidersState
              handleUseCurrentLocation={handleUseCurrentLocation}
              styles={styles}
              tokens={tokens}
            />
          );
        }
        if (isSearching) {
          return (
            <EmptySearchState
              accent={accent}
              searchText={searchText}
              styles={styles}
            />
          );
        }
        if (searchText) {
          const hasActiveFilters = activeFilterCount > 0;
          const tryInstead = activeService === "Meat" ? ["Chicken curry cut", "Mutton", "Prawns"] : ["Biryani", "Pizza", "₹149 meals"];
          return (
            <HomeEmptySearchContainer
              hasActiveFilters={hasActiveFilters}
              tryInstead={tryInstead}
              activeFilterCount={activeFilterCount}
              clearAllFilters={clearAllFilters}
              searchText={searchText}
              setSearchText={setSearchText}
              styles={styles}
              tokens={tokens}
            />
          );
        }
        if (nearbyDriversCount === 0) {
          return (
            <HomeNoServiceContainer
              accent={accent}
              checkNearbyDrivers={checkNearbyDrivers}
              getCoords={getCoords}
              isRetryingDrivers={isRetryingDrivers}
              setIsRetryingDrivers={setIsRetryingDrivers}
              styles={styles}
            />
          );
        }
        if (visibleItems.length === 0) {
          const serviceName = activeService === "Meat" ? "meat" : "food";
          return (
            <HomeNoServiceContainer2
              serviceName={serviceName}
              styles={styles}
              tokens={tokens}
            />
          );
        }
        if (activeFilterCount > 0) {
          return (
            <HomeNoServiceContainer3
              activeFilterCount={activeFilterCount}
              clearAllFilters={clearAllFilters}
              styles={styles}
              tokens={tokens}
            />
          );
        }
        return null;
      }}
      ListFooterComponent={() => (
        <View>
          {loadingMore ? <ActivityIndicator size="small" color={accent.accent} style={{ marginVertical: 20 }} /> : <View style={{ height: 24 }} />}
        </View>
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={[styles.mainScrollContent, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 140 : tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
      refreshing={false}
      onRefresh={async () => {
        setPage(1);
        setHasMore(true);
        const { lat, lng } = await getCoords();
        checkNearbyDrivers(lat, lng);
        if (activeService === "Meat") fetchMeatCenters(lat, lng, 1);
        else { fetchVendors(lat, lng, 1); fetch149StoreItems(lat, lng); }
      }}
      onScroll={onMainScroll}
      scrollEventThrottle={16}
    />

    <AppTabBar active="home" accent={activeService === "Meat" ? "meat" : "food"} cartVendorName={cartVendorName} />

    {/* Search overlay */}
    </>
  );
}
