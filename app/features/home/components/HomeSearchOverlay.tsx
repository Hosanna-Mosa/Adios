import React from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { DishSearchResultItem } from "./DishSearchResultItem";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it
// used to read from the screen's scope is now a prop of the same name, so
// the markup did not have to be touched. Props are typed loosely because
// this is a faithful lift-and-shift and the screen is the only caller --
// tightening them is a separate change with its own test pass.

interface Props {
  activeService: any;
  accent: any;
  addRecentSearch: any;
  clearRecentSearches: any;
  insets: any;
  isSearchVisible: any;
  isSearching: any;
  listData: any[];
  recentSearches: any[];
  searchBackdropAnimatedStyle: any;
  searchBackdropOpacity: any;
  searchSheetAnimatedStyle: any;
  searchText: any;
  searchTranslateY: any;
  setIsSearchActive: React.Dispatch<React.SetStateAction<any>>;
  setSearchText: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  tokens: any;
}

export function HomeSearchOverlay({
  activeService,
  accent,
  addRecentSearch,
  clearRecentSearches,
  insets,
  isSearchVisible,
  isSearching,
  listData,
  recentSearches,
  searchBackdropAnimatedStyle,
  searchBackdropOpacity,
  searchSheetAnimatedStyle,
  searchText,
  searchTranslateY,
  setIsSearchActive,
  setSearchText,
  styles,
  tokens,
}: Props) {
  return (
    <Modal
      visible={isSearchVisible}
      animationType="none"
      transparent
      onRequestClose={() => setIsSearchActive(false)}
      onShow={() => {
        searchTranslateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
        searchBackdropOpacity.value = withTiming(1, { duration: 350 });
      }}
    >
      <View style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }, searchBackdropAnimatedStyle]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsSearchActive(false)} />
        </Animated.View>
        <Animated.View
          style={[
            styles.searchSheet,
            { paddingTop: Math.max(insets.top, 16), maxHeight: Dimensions.get("window").height * 0.85 },
            searchSheetAnimatedStyle,
          ]}
        >
          <View style={styles.searchSheetHeaderRow}>
            <TouchableOpacity onPress={() => setIsSearchActive(false)}>
              <Ionicons name="arrow-back" size={moderateScale(22)} color={tokens.sec} />
            </TouchableOpacity>
            <Text style={styles.searchSheetHeaderText}>Search for dishes & restaurants</Text>
          </View>

          <View style={styles.searchSheetInputRow}>
            <View style={styles.searchSheetInputWrap}>
              <Ionicons name="search" size={moderateScale(18)} color={tokens.muted} />
              <TextInput
                style={styles.searchSheetInput}
                placeholder="Try 'Bawarchi'"
                placeholderTextColor={tokens.muted}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => addRecentSearch(searchText)}
              />
              {!!searchText && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={moderateScale(18)} color={tokens.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

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
        </Animated.View>
      </View>
    </Modal>
  );
}
