import { useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useCartStore } from "@/contexts/cartStore";
import { createStyles } from "./149-store.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";

// State, data loading and handlers for app/149-store.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

// Standard Indian food-labeling convention: a circle for veg, a triangle
// for non-veg, both inside a small squared-off border — not just two dot
// shapes with a color swap.

export function useStore149() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { currentCoords, currentLocation } = useDeliveryStore();
  const { items: cartItems, requestAddItem: addCartItem, updateQuantity: updateCartQuantity } = useCartStore();
  const [store149Items, setStore149Items] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.food;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  // The saved delivery address is the provenance this screen shows, so read it
  // here rather than relying on whatever the home tab last pushed into the store.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const activeStr = await AsyncStorage.getItem("active_address");
          if (activeStr) setSelectedAddress(JSON.parse(activeStr));
        } catch (e) {
          console.error("Failed to load active address:", e);
        }
      })();
    }, [])
  );

  const lat = selectedAddress?.coordinates?.lat ?? selectedAddress?.location?.coordinates?.[1] ?? currentCoords?.lat ?? null;
  const lng = selectedAddress?.coordinates?.lng ?? selectedAddress?.location?.coordinates?.[0] ?? currentCoords?.lng ?? null;

  useEffect(() => {
    if (lat == null || lng == null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await customFetch<any>(`/food/store-149?lat=${lat}&lng=${lng}`);
        if (!cancelled && Array.isArray(data)) setStore149Items(data);
      } catch (error) {
        console.error("Error fetching 149 store items:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchItems();
    return () => { cancelled = true; };
  }, [lat, lng]);

  const outletCount = useMemo(() => new Set(store149Items.map((i) => i.vendorId)).size, [store149Items]);
  const areaLabel = selectedAddress?.label && selectedAddress.label !== "Other" ? selectedAddress.label : "Home";
  const areaLine = selectedAddress?.addressLine || selectedAddress?.city || currentLocation || "your area";
  const farthestKm = useMemo(() => {
    const distances = store149Items
      .map((item) => item.distanceKm)
      .filter((value): value is number => typeof value === "number");
    return distances.length ? Math.max(...distances).toFixed(1) : null;
  }, [store149Items]);
  const categories = useMemo(() => {
    const set = new Set<string>();
    store149Items.forEach((i) => { if (i.category) set.add(i.category); });
    return ["All", ...Array.from(set).slice(0, 6)];
  }, [store149Items]);
  const visibleItems = activeCategory === "All" ? store149Items : store149Items.filter((i) => i.category === activeCategory);


  return {
  insets, tabBarHeight, cartItems, addCartItem, updateCartQuantity, store149Items, loading,
  selectedItem, setSelectedItem, isSheetVisible, setIsSheetVisible, activeCategory,
  setActiveCategory, tokens, accent, styles, lat, lng, outletCount, areaLabel, areaLine,
  farthestKm, categories, visibleItems
  };
}
