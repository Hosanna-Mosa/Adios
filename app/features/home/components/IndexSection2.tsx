import { HomeSearchOverlay } from "@/features/home/components/HomeSearchOverlay";

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
  addRecentSearch: any;
  clearRecentSearches: any;
  tokens: any;
  accent: any;
  styles: any;
  listData: any;
  isSearching: any;
}

export function IndexSection2({
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
  addRecentSearch,
  clearRecentSearches,
  tokens,
  accent,
  styles,
  listData,
  isSearching,
}: Props) {
  return (
    <>
    <HomeSearchOverlay
      activeService={activeService}
      accent={accent}
      addRecentSearch={addRecentSearch}
      clearRecentSearches={clearRecentSearches}
      insets={insets}
      isSearchVisible={isSearchVisible}
      isSearching={isSearching}
      listData={listData}
      recentSearches={recentSearches}
      searchBackdropAnimatedStyle={searchBackdropAnimatedStyle}
      searchBackdropOpacity={searchBackdropOpacity}
      searchSheetAnimatedStyle={searchSheetAnimatedStyle}
      searchText={searchText}
      searchTranslateY={searchTranslateY}
      setIsSearchActive={setIsSearchActive}
      setSearchText={setSearchText}
      styles={styles}
      tokens={tokens}
    />

    {/* Distance sheet */}
    </>
  );
}
