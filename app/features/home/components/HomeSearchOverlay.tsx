import React from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { DishSearchResultItem } from "./DishSearchResultItem";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { HomeSearchOverlaySearchForDishes } from "./HomeSearchOverlaySearchForDishes";

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

export function HomeSearchOverlay(props: Props) {
  const { isSearchVisible, searchBackdropAnimatedStyle, searchBackdropOpacity, searchTranslateY, setIsSearchActive } = props;
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
        <HomeSearchOverlaySearchForDishes {...props} />
      </View>
    </Modal>
  );
}
