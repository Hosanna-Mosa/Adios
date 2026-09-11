import { FlatList, RefreshControl } from "react-native";
import { FavoriteCard } from "@/features/food/components/FavoriteCard";
import { ItemFavoriteCard } from "@/features/food/components/ItemFavoriteCard";
import { AppTabBar } from "@/components/AppTabBar";
import { FavoritesEmptyContainer } from "@/features/food/components/FavoritesEmptyContainer";
import { FavoritesEmptyContainer2 } from "@/features/food/components/FavoritesEmptyContainer2";
import { FavoritesSegmentWrap } from "@/features/food/components/FavoritesSegmentWrap";
import { FavoritesCenterContainer } from "@/features/food/components/FavoritesCenterContainer";
import { FavoritesCenterContainer2 } from "@/features/food/components/FavoritesCenterContainer2";
import { FavoritesHeaderRow } from "@/features/food/components/FavoritesHeaderRow";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useFavorites } from "@/features/food/useFavorites";

export default function FavoritesScreen() {
  const {
  insets, tabBarHeight, tokens, accent, styles, toggleFavoriteItem, loading, favorites,
  itemsLoading, activeTab, setActiveTab, fetchFavorites, fetchFavoriteItems, activeFavorites,
  activeFavoriteItems, popularNearby
  } = useFavorites();

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
