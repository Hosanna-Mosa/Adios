import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { DishSearchResultItem } from "./DishSearchResultItem";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Section of HomeSearchOverlaySearchForDishes, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  activeService: string;
  accent: ServiceTokens;
  clearRecentSearches: () => void;
  isSearching: boolean;
  listData: any[];
  recentSearches: any[];
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeSearchOverlaySearchForDishesRECENTLYSEARCHED({
  activeService,
  accent,
  clearRecentSearches,
  isSearching,
  listData,
  recentSearches,
  searchText,
  setSearchText,
  styles,
  tokens,
}: Props) {
  return (
    <>
    {!searchText ? (
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {recentSearches.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={styles.searchSectionHeadRow}>
              <Text style={styles.searchSectionTitle}>RECENTLY SEARCHED</Text>
              <TouchableOpacity onPress={clearRecentSearches}><Text style={styles.searchClearLink}>Clear</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {recentSearches.map((query, index) => (
                <TouchableOpacity key={index} style={styles.searchSuggestChip} onPress={() => setSearchText(query)}>
                  <Ionicons name="time-outline" size={moderateScale(14)} color={tokens.sec} />
                  <Text style={styles.searchSuggestChipText}>{query}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.searchSectionTitle}>RECOMMENDED</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {["Biryani", "Pizza", "Burger", "Chinese", "Desserts"].map((rec, i) => (
              <TouchableOpacity key={i} style={styles.searchSuggestChip} onPress={() => setSearchText(rec)}>
                <Text style={styles.searchSuggestChipText}>{rec}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    ) : (
      <FlatList
        data={listData.filter((item: any) => item.isHeader || item.isRestaurant || item.isDish)}
        keyExtractor={(item) => item._id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }: any) => {
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
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() =>
          isSearching ? (
            <View style={styles.emptySearchContainer}>
              <ActivityIndicator size="small" color={accent.accent} />
              <Text style={styles.emptySearchTitle}>Searching…</Text>
              <Text style={styles.emptySearchSubtitle}>Looking for &quot;{searchText.trim()}&quot; across nearby menus.</Text>
            </View>
          ) : (
            <View style={styles.emptySearchContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={26} color={tokens.sec} />
              </View>
              <Text style={styles.emptySearchTitle}>No results found</Text>
              <Text style={styles.emptySearchSubtitle}>We couldn&apos;t find any outlets matching &quot;{searchText}&quot;.</Text>
            </View>
          )
        }
      />
    )}
    </>
  );
}
