import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { Easing, runOnJS, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHomeStore } from "@/contexts/homeStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeRestaurants() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const restaurants = useHomeStore((s) => s.restaurants);
  const setRestaurants = useHomeStore((s) => s.setRestaurants);
  const meatCenters = useHomeStore((s) => s.meatCenters);
  const setMeatCenters = useHomeStore((s) => s.setMeatCenters);
  const nearbyDriversCount = useHomeStore((s) => s.nearbyDriversCount);
  const setNearbyDriversCount = useHomeStore((s) => s.setNearbyDriversCount);
  const loading = useHomeStore((s) => s.loading);
  const setLoading = useHomeStore((s) => s.setLoading);
  const loadingDrivers = useHomeStore((s) => s.loadingDrivers);
  const setLoadingDrivers = useHomeStore((s) => s.setLoadingDrivers);
  const store149Items = useHomeStore((s) => s.store149Items);
  const setStore149Items = useHomeStore((s) => s.setStore149Items);
  const activeService = useHomeStore((s) => s.activeService);
  const setActiveService = useHomeStore((s) => s.setActiveService);

  const [searchText, setSearchText] = useState("");
  // Debounced copy of searchText — the term actually sent to the server.
  const [searchQuery, setSearchQuery] = useState("");
  // The term the currently loaded restaurant list was fetched with.
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchTranslateY = useSharedValue(-Dimensions.get("window").height);
  const searchBackdropOpacity = useSharedValue(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isSearchActive) {
      setIsSearchVisible(true);
      // Entry animation is handled by onShow in Modal
    } else if (isSearchVisible) {
      searchTranslateY.value = withTiming(-Dimensions.get("window").height, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      searchBackdropOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(setIsSearchVisible)(false);
      });
    }
  }, [isSearchActive]);

  return { restaurants, setRestaurants, meatCenters, setMeatCenters, nearbyDriversCount, setNearbyDriversCount, loading, setLoading, loadingDrivers, setLoadingDrivers, store149Items, setStore149Items, activeService, setActiveService, insets, tabBarHeight, searchText, setSearchText, searchQuery, setSearchQuery, appliedSearchTerm, setAppliedSearchTerm, setIsSearchActive, isSearchVisible, searchTranslateY, searchBackdropOpacity, recentSearches, setRecentSearches };
}
