import { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeSearchSheetAnimatedStyle(searchTranslateY: any, searchBackdropOpacity: any, recentSearches: any, setRecentSearches: any) {
  const searchSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: searchTranslateY.value }],
  }));
  const searchBackdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: searchBackdropOpacity.value,
  }));

  const [banners, setBanners] = useState<any[]>([]);
  // True until the first GET /banners settles, so the carousel and greeting ad
  // show a shimmer instead of flashing the hardcoded fallback promos.
  const [bannersLoading, setBannersLoading] = useState(true);
  const [hasShownStartupAd, setHasShownStartupAd] = useState(false);
  const [activeStartupAd, setActiveStartupAd] = useState<any | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const carouselRef = useAnimatedRef<Animated.ScrollView>();
  const bannerScrollX = useSharedValue(0);
  const bannerIndexRef = useRef(0);
  const onBannerScroll = useAnimatedScrollHandler((event) => {
    bannerScrollX.value = event.contentOffset.x;
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("recent_searches");
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    })();
  }, []);

  const addRecentSearch = async (query: string) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    const newRecent = [trimmed, ...recentSearches.filter((q: any) => q !== trimmed)].slice(0, 5);
    setRecentSearches(newRecent);
    try {
      await AsyncStorage.setItem("recent_searches", JSON.stringify(newRecent));
    } catch (e) {
      console.error("Failed to save recent searches", e);
    }
  };

  return { searchSheetAnimatedStyle, searchBackdropAnimatedStyle, banners, setBanners, bannersLoading, setBannersLoading, hasShownStartupAd, setHasShownStartupAd, activeStartupAd, setActiveStartupAd, carouselRef, bannerScrollX, bannerIndexRef, onBannerScroll, addRecentSearch };
}
