import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFocusEffect } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { FavoriteCard } from "@/features/food/components/FavoriteCard";
import { ItemFavoriteCard } from "@/features/food/components/ItemFavoriteCard";
import { designTokens, type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useAuthStore } from "@/contexts/authStore";
import { useHomeStore } from "@/contexts/homeStore";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";

import { FavoritesEmptyContainer } from "@/features/food/components/FavoritesEmptyContainer";
import { FavoritesEmptyContainer2 } from "@/features/food/components/FavoritesEmptyContainer2";
import { FavoritesSegmentWrap } from "@/features/food/components/FavoritesSegmentWrap";
import { FavoritesCenterContainer } from "@/features/food/components/FavoritesCenterContainer";
import { FavoritesCenterContainer2 } from "@/features/food/components/FavoritesCenterContainer2";
import { FavoritesHeaderRow } from "@/features/food/components/FavoritesHeaderRow";
import { ScreenShell } from "@/components/ui/ScreenShell";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { theme } = useThemeStore();
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
      const data = await customFetch<any[]>("/users/favorites");
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
      const data = await customFetch<any[]>("/users/favorite-items");
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

  return (
    <ScreenShell>
      <FavoritesHeaderRow
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <FavoritesSegmentWrap
        activeFavoriteItems={activeFavoriteItems}
        activeFavorites={activeFavorites}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        styles={styles}
      />

      {activeTab === "items" ? (
        itemsLoading && activeFavoriteItems.length === 0 ? (
          <FavoritesCenterContainer
            accent={accent}
            styles={styles}
          />
        ) : (
          <FlatList
            data={activeFavoriteItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <ItemFavoriteCard item={item} index={index} tokens={tokens} styles={styles} onUnfavorite={toggleFavoriteItem} />
            )}
            refreshControl={<RefreshControl refreshing={itemsLoading} onRefresh={fetchFavoriteItems} tintColor={accent.accent} />}
            ListEmptyComponent={() => (
              <FavoritesEmptyContainer
                accent={accent}
                styles={styles}
              />
            )}
            contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 24 }]}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : loading && activeFavorites.length === 0 ? (
        <FavoritesCenterContainer2
          accent={accent}
          styles={styles}
        />
      ) : (
        <FlatList
          data={activeFavorites}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => <FavoriteCard item={item} index={index} tokens={tokens} styles={styles} />}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchFavorites} tintColor={accent.accent} />}
          ListEmptyComponent={() => (
            <FavoritesEmptyContainer2
              accent={accent}
              favorites={favorites}
              popularNearby={popularNearby}
              styles={styles}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 24 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AppTabBar active="account" />
    </ScreenShell>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    headerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
    backBtn: {
      width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
      backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(17), color: tokens.text },

    segmentWrap: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 4 },
    segmentTrack: { position: "relative", backgroundColor: tokens.sunken, borderRadius: 999, padding: 4, flexDirection: "row" },
    segmentThumb: { position: "absolute", top: 4, bottom: 4, left: 4, width: "calc(50% - 4px)" as any, backgroundColor: tokens.surface, borderRadius: 999 },
    segmentCell: { flex: 1, alignItems: "center", paddingVertical: 10 },
    segmentLabel: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: tokens.sec },
    segmentLabelActive: { color: tokens.text },

    listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 160 },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 },

    card: { flexDirection: "row", gap: 14, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: moderateScale(18), padding: 14, marginBottom: 14 },
    cardThumb: { width: moderateScale(88), height: moderateScale(88), borderRadius: moderateScale(8), backgroundColor: tokens.sunken, overflow: "hidden", flexShrink: 0 },
    cardBody: { flex: 1, minWidth: 0 },
    cardTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    cardName: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(17), letterSpacing: -0.1, color: tokens.text },
    serviceTag: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginTop: 6 },
    serviceTagText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 1, textTransform: "uppercase" },
    cardMeta: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 6 },
    reorderBtn: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 9 },
    reorderBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(12) },

    emptyContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
    heartCircle: { width: moderateScale(76), height: moderateScale(76), borderRadius: moderateScale(24), backgroundColor: accent.skin, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyTitle: { fontFamily: fontFamilies.heading.semibold, fontSize: moderateScale(22), letterSpacing: -0.2, color: tokens.text, textAlign: "center" },
    emptySubtitle: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(15), lineHeight: moderateScale(21), color: tokens.sec, textAlign: "center", marginTop: 10, marginBottom: 22 },
    exploreBtn: { width: "100%", alignItems: "center", backgroundColor: accent.accent, borderRadius: moderateScale(14), paddingVertical: 15 },
    exploreBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },

    popularSection: { width: "100%", marginTop: 34 },
    popularLabel: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 12, textAlign: "left" },
    popularCard: { width: 150 },
    popularImage: { width: 150, height: 100, borderRadius: moderateScale(8), backgroundColor: tokens.sunken },
    popularName: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text, marginTop: 8 },
    popularMeta: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec, marginTop: 2 },
  });
