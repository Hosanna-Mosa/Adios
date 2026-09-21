import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./cart.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { useHomeStore, useServiceAccent } from "@/contexts/homeStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { getVendor } from "@/services/catalog.service";

// Split out of useCart so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useCartInsets() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const { vendorName: paramVendorName } = useLocalSearchParams();
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const vendorId = useCartStore((s) => s.vendorId);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const storeVendorName = useCartStore((s) => s.vendorName);
  const cartStatus = useCartStore((s) => s.status);
  const syncNotices = useCartStore((s) => s.syncNotices);
  const clearSyncNotices = useCartStore((s) => s.clearSyncNotices);

  // The active Food/Meat mode is the single source of truth for the accent, so
  // the cart tints to whatever the customer is actually shopping.
  const activeService = useHomeStore((s) => s.activeService);
  const serviceKey = activeService === "Meat" ? "meat" : "food";
  const accent = useServiceAccent();
  const styles = useMemo(() => createStyles(tokens, accent), [theme, accent]);

  const [fetchedVendorName, setFetchedVendorName] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    // Only food vendors expose a public by-id lookup today — meat centers
    // don't, so their delivery fee genuinely can't be sourced here yet.
    getVendor<any>(vendorId)
      .then((v) => {
        if (v?.name) setFetchedVendorName(v.name);
        if (typeof v?.deliveryFee === "number") setDeliveryFee(v.deliveryFee);
      })
      .catch(() => {});
  }, [vendorId]);

  return { insets, tabBarHeight, tokens, paramVendorName, items, getTotalPrice, vendorId, updateQuantity, addItem, clearCart, storeVendorName, cartStatus, syncNotices, clearSyncNotices, serviceKey, accent, styles, fetchedVendorName, deliveryFee, menuItems, setMenuItems, recentOrders, setRecentOrders, loadingRecent, setLoadingRecent, showPromoInput, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo, isApplyingPromo, setIsApplyingPromo, promoError, setPromoError };
}
