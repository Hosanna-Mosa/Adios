import { HomeSearchLayer } from "@/features/home/components/HomeSearchLayer";
import { HomeSheetsAndAds } from "@/features/home/components/HomeSheetsAndAds";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HomeStyles } from "@/features/home/home.styles";

// Markup moved out of (tabs)/index.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  activeService: string;
  insets: EdgeInsets;
  searchText: string;
  setSearchText: any;
  setIsSearchActive: any;
  isSearchVisible: boolean;
  searchTranslateY: any;
  searchBackdropOpacity: any;
  recentSearches: any;
  searchSheetAnimatedStyle: any;
  searchBackdropAnimatedStyle: any;
  hasShownStartupAd: boolean;
  activeStartupAd: any;
  setActiveStartupAd: any;
  addRecentSearch: any;
  clearRecentSearches: () => void;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  styles: HomeStyles;
  isDistanceSheetOpen: boolean;
  setIsDistanceSheetOpen: any;
  distanceOption: any;
  setDistanceOption: any;
  customDistance: any;
  setCustomDistance: any;
  appliedDistanceKm: any;
  applyDistanceFilter: any;
  clearDistanceFilter: () => void;
  listData: any;
  isSearching: boolean;
}

export function HomeOverlays({
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
    <HomeSearchLayer
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
    <HomeSheetsAndAds
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
