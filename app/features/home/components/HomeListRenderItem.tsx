import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { DishSearchResultItem } from "@/features/home/components/DishSearchResultItem";
import { HomeSkeletonCard } from "@/features/home/components/HomeSkeletonCard";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { staggerListItem } from "@/motion/presets";

// The home list's row renderer, lifted out of HomeListSection so both files
// stay under 150 lines. The markup is unchanged.

export const buildHomeListRenderItem = (accent: any, activeService: any, styles: any, tokens: any) =>
  ({ item, index }: { item: any; index: number }) => {
        if (item.isSkeleton) return <HomeSkeletonCard tokens={tokens} />;
        if (item.isHeader) return <Text style={styles.listSectionHeader}>{item.title}</Text>;
        if (item.isRestaurant) {
          return (
            <Animated.View entering={staggerListItem(index)}>
              <RestaurantListItem {...item} isMeat={activeService === "Meat"} />
            </Animated.View>
          );
        }
        if (item.isDish) {
          return (
            <Animated.View entering={staggerListItem(index)}>
              <DishSearchResultItem item={item} tokens={tokens} accent={accent} styles={styles} />
            </Animated.View>
          );
        }
        return null;
      };
