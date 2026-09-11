import { IndexSection2 } from "@/features/home/components/IndexSection2";
import { IndexSection3 } from "@/features/home/components/IndexSection3";

// Markup moved out of (tabs)/index.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  activeService: any;
  insets: any;
  searchText: any;
  setSearchText: any;
  setIsSearchActive: any;
  isSearchVisible: any;
  searchTranslateY: any;
  searchBackdropOpacity: any;
  recentSearches: any;
  searchSheetAnimatedStyle: any;
  searchBackdropAnimatedStyle: any;
  hasShownStartupAd: any;
  activeStartupAd: any;
  setActiveStartupAd: any;
  addRecentSearch: any;
  clearRecentSearches: any;
  tokens: any;
  accent: any;
  styles: any;
  isDistanceSheetOpen: any;
  setIsDistanceSheetOpen: any;
  distanceOption: any;
  setDistanceOption: any;
  customDistance: any;
  setCustomDistance: any;
  appliedDistanceKm: any;
  applyDistanceFilter: any;
  clearDistanceFilter: any;
  listData: any;
  isSearching: any;
}

export function IndexSection5({
  activeService,
  insets,
  searchText,
  setSearchText,
  setIsSearchActive,
  isSearchVisible,
  searchTranslateY,
  searchBackdropOpacity,
  recentSearches,
  searchSheetAnimatedStyle,
  searchBackdropAnimatedStyle,
  hasShownStartupAd,
  activeStartupAd,
  setActiveStartupAd,
  addRecentSearch,
  clearRecentSearches,
  tokens,
  accent,
  styles,
  isDistanceSheetOpen,
  setIsDistanceSheetOpen,
  distanceOption,
  setDistanceOption,
  customDistance,
  setCustomDistance,
  appliedDistanceKm,
  applyDistanceFilter,
  clearDistanceFilter,
  listData,
  isSearching,
}: Props) {
  return (
    <>
    <IndexSection2
      activeService={activeService}
      insets={insets}
      searchText={searchText}
      setSearchText={setSearchText}
      setIsSearchActive={setIsSearchActive}
      isSearchVisible={isSearchVisible}
      searchTranslateY={searchTranslateY}
      searchBackdropOpacity={searchBackdropOpacity}
      recentSearches={recentSearches}
      searchSheetAnimatedStyle={searchSheetAnimatedStyle}
      searchBackdropAnimatedStyle={searchBackdropAnimatedStyle}
      addRecentSearch={addRecentSearch}
      clearRecentSearches={clearRecentSearches}
      tokens={tokens}
      accent={accent}
      styles={styles}
      listData={listData}
      isSearching={isSearching}
    />
    <IndexSection3
      insets={insets}
      hasShownStartupAd={hasShownStartupAd}
      activeStartupAd={activeStartupAd}
      setActiveStartupAd={setActiveStartupAd}
      tokens={tokens}
      styles={styles}
      isDistanceSheetOpen={isDistanceSheetOpen}
      setIsDistanceSheetOpen={setIsDistanceSheetOpen}
      distanceOption={distanceOption}
      setDistanceOption={setDistanceOption}
      customDistance={customDistance}
      setCustomDistance={setCustomDistance}
      appliedDistanceKm={appliedDistanceKm}
      applyDistanceFilter={applyDistanceFilter}
      clearDistanceFilter={clearDistanceFilter}
    />
    </>
  );
}
