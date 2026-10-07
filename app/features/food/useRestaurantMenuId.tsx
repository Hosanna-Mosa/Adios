import { useState, useRef, useMemo, useCallback } from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./restaurant-menu.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useCartStore } from "@/contexts/cartStore";
import { useAuthStore } from "@/contexts/authStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { FoodItem } from "./useRestaurantMenu.shared";
import { useOutletOrderingState } from "./useOutletOrderingState";
import { showOutletClosedAlert } from "@/components/shared/outletClosed";

// Split out of useRestaurantMenu so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRestaurantMenuId() {
  const {
    id, name, image, rating, reviews, isMeat, highlightDishId,
    categories, minOrderValue, time, distance, address, isOpen,
  } = useLocalSearchParams();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight({ hideTabs: true });
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services[isMeat === "true" ? "meat" : "food"];
  const styles = useMemo(() => createStyles(tokens, accent), [theme, isMeat]);

  const setVendorId = useDeliveryStore((s) => s.setVendorId);
  const items = useCartStore((s) => s.items);
  const requestAddItem = useCartStore((s) => s.requestAddItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const user = useAuthStore((s) => s.user);
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);
  const isFavorite = useMemo(() => user?.favorites?.includes(id as string) || false, [user?.favorites, id]);
  const toggleFavoriteItem = useAuthStore((s) => s.toggleFavoriteItem);
  const isDishFavorite = useCallback(
    (dishId: string) => user?.favoriteItems?.includes(dishId) || false,
    [user?.favoriteItems]
  );

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [scrolledPast, setScrolledPast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState("");
  const [selectedDishDetail, setSelectedDishDetail] = useState<FoodItem | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const { orderingState, isClosed: outletClosed, refresh: refreshOrderingState } = useOutletOrderingState(id as string, isOpen === "false" ? false : undefined);

  const handleAddToCart = (item: FoodItem) => {
    if (loadingItems[item._id] || item.isAvailable === false) return;
    // The partner switched "Accepting orders" off, or it's outside its hours.
    // Re-check in the background so a reopened outlet unlocks on the next tap.
    if (outletClosed) {
      showOutletClosedAlert(orderingState, name as string);
      refreshOrderingState();
      return;
    }
    setLoadingItems((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      requestAddItem(item as any, id as string, name as string, (image as string) || undefined);
      setLoadingItems((prev) => ({ ...prev, [item._id]: false }));
    }, 450);
  };

  return { id, name, image, rating, reviews, isMeat, highlightDishId, categories, minOrderValue, time, distance, address, insets, tabBarHeight, tokens, accent, styles, setVendorId, items, updateQuantity, getItemCount, toggleFavorite, isFavorite, toggleFavoriteItem, isDishFavorite, loading, setLoading, menu, setMenu, activeCategory, setActiveCategory, scrolledPast, setScrolledPast, searchQuery, setSearchQuery, vegOnly, setVegOnly, highlightedItemId, setHighlightedItemId, selectedDishDetail, setSelectedDishDetail, scrollViewRef, loadingItems, setLoadingItems, handleAddToCart, orderingState, outletClosed };
}
