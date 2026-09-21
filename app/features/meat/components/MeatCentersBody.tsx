import { ActivityIndicator, FlatList, View } from "react-native";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { type ServiceTokens } from "@/constants/colors";

// Moved out of app/meat-centers.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  fetchMeatCenters: any;
  getCoords: any;
  loadMore: any;
  loading: boolean;
  loadingMore: any;
  renderHeader: any;
  selectedCategory: any;
  setHasMore: any;
  setPage: any;
  visibleCenters: any;
}

export function MeatCentersBody({
  accent,
  fetchMeatCenters,
  getCoords,
  loadMore,
  loading,
  loadingMore,
  renderHeader,
  selectedCategory,
  setHasMore,
  setPage,
  visibleCenters,
}: Props) {
  return (
    <>
    <FlatList
      data={visibleCenters}
      keyExtractor={(item) => item._id}
      renderItem={({ item, index }) => (
        <Animated.View entering={staggerListItem(index)}>
          <RestaurantListItem {...item} isMeat={true} />
        </Animated.View>
      )}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={() =>
        loadingMore ? <ActivityIndicator size="small" color={accent.accent} style={{ marginVertical: 20 }} /> : <View style={{ height: 120 }} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={async () => {
        setPage(1);
        setHasMore(true);
        const { lat, lng } = await getCoords();
        fetchMeatCenters(lat, lng, 1, selectedCategory);
      }}
    />
    </>
  );
}
