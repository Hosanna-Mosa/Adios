import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useHomeStore } from "@/contexts/homeStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { getFavouriteItems, getFavouriteOutlets } from "@/services/users.service";

// State, data loading and handlers for app/favorites.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },

    segmentWrap: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 4 },
    segmentTrack: { position: "relative", backgroundColor: tokens.sunken, borderRadius: 999, padding: 4, flexDirection: "row" },
    segmentThumb: { position: "absolute", top: 4, bottom: 4, left: 4, width: "calc(50% - 4px)" as any, backgroundColor: tokens.surface, borderRadius: 999 },
    segmentCell: { flex: 1, alignItems: "center", paddingVertical: 10 },
    segmentLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    segmentLabelActive: { color: tokens.text },

    listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 160 },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 },

    card: { flexDirection: "row", gap: 14, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: moderateScale(18), padding: 14, marginBottom: 14 },
    cardThumb: { width: moderateScale(88), height: moderateScale(88), borderRadius: moderateScale(8), backgroundColor: tokens.sunken, overflow: "hidden", flexShrink: 0 },
    cardBody: { flex: 1, minWidth: 0 },
    cardTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    cardName: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, letterSpacing: -0.1, color: tokens.text },
    serviceTag: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginTop: 6 },
    serviceTagText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase" },
    cardMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 6 },
    reorderBtn: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 9 },
    reorderBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small },

    emptyContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
    heartCircle: { width: moderateScale(76), height: moderateScale(76), borderRadius: moderateScale(24), backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.extraLarge, letterSpacing: -0.2, color: tokens.text, textAlign: "center" },
    emptySubtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 10, marginBottom: 22 },
    exploreBtn: { width: "100%", alignItems: "center", backgroundColor: accent.accent, borderRadius: moderateScale(14), paddingVertical: 15 },
    exploreBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },

    popularSection: { width: "100%", marginTop: 34 },
    popularLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12, textAlign: "left" },
    popularCard: { width: 150 },
    popularImage: { width: 150, height: 100, borderRadius: moderateScale(8), backgroundColor: tokens.sunken },
    popularName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: 8 },
    popularMeta: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: 2 },
  });

export function useFavorites() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  // Screen-level chrome only — individual favorite cards below already pick
  // their own food/meat accent per item (see isMeat in the row components).
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);
  const user = useAuthStore((s) => s.user);
  const toggleFavoriteItem = useAuthStore((s) => s.toggleFavoriteItem);

  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"outlets" | "items">("outlets");

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavouriteOutlets();
      if (Array.isArray(data)) setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteItems = async () => {
    try {
      setItemsLoading(true);
      const data = await getFavouriteItems();
      if (Array.isArray(data)) setFavoriteItems(data);
    } catch (error) {
      console.error("Error fetching favorite items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchFavorites(); fetchFavoriteItems(); }, []));
  useEffect(() => { fetchFavorites(); }, [user?.favorites?.length]);
  useEffect(() => { fetchFavoriteItems(); }, [user?.favoriteItems?.length]);

  const activeFavorites = useMemo(
    () => favorites.filter((item) => user?.favorites?.includes(item._id)),
    [favorites, user?.favorites]
  );

  const activeFavoriteItems = useMemo(
    () => favoriteItems.filter((item) => user?.favoriteItems?.includes(item._id)),
    [favoriteItems, user?.favoriteItems]
  );

  // Subscribed rather than read via getState(), so this fills in when the home
  // fetch lands instead of staying empty for anyone who opens Favorites first.
  const restaurants = useHomeStore((s) => s.restaurants);
  const popularNearby = useMemo(
    () => [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
    [restaurants]
  );


  return {
  insets, tabBarHeight, tokens, accent, styles, toggleFavoriteItem, loading, favorites,
  itemsLoading, activeTab, setActiveTab, fetchFavorites, fetchFavoriteItems, activeFavorites,
  activeFavoriteItems, popularNearby
  };
}

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type FavoritesStyles = ReturnType<typeof createStyles>;
