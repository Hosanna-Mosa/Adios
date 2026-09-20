import { HomeSearchOverlay } from "@/features/home/components/HomeSearchOverlay";
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
  addRecentSearch: any;
  clearRecentSearches: () => void;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  styles: HomeStyles;
  listData: any;
  isSearching: boolean;
}

export function HomeSearchLayer({
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
