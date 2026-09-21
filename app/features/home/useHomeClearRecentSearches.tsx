import { useEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStyles } from "./home.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { SPRING } from "@/motion/presets";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeClearRecentSearches(restaurants: any, meatCenters: any, activeService: any, setRecentSearches: any) {
  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem("recent_searches");
  };

  const [loadingMore, setLoadingMore] = useState(false);
  const [isRetryingDrivers, setIsRetryingDrivers] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services[activeService === "Meat" ? "meat" : "food"];
  const styles = useMemo(() => createStyles(tokens, accent), [theme, activeService]);

  const cartVendorId = useCartStore((s) => s.vendorId);
  const cartVendorName = useMemo(() => {
    if (!cartVendorId) return undefined;
    const list = activeService === "Meat" ? meatCenters : restaurants;
    return list.find((v: any) => v._id === cartVendorId)?.name;
  }, [cartVendorId, meatCenters, restaurants, activeService]);

  const isHoveringSearch = useCartStore((s) => s.isHoveringSearch);
  const searchBarScale = useSharedValue(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    searchBarScale.value = withSpring(isHoveringSearch ? 1.06 : 1.0, SPRING);
  }, [isHoveringSearch]);

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { clearRecentSearches, loadingMore, setLoadingMore, isRetryingDrivers, setIsRetryingDrivers, page, setPage, hasMore, setHasMore, tokens, accent, styles, cartVendorName, keyboardHeight, searchBarAnimatedStyle };
}
