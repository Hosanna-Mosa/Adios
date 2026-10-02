import React from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { DishSearchResultItem } from "./DishSearchResultItem";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { HomeSearchOverlaySearchForDishes } from "./HomeSearchOverlaySearchForDishes";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it
// used to read from the screen's scope is now a prop of the same name, so
// the markup did not have to be touched. Props are typed loosely because
// this is a faithful lift-and-shift and the screen is the only caller --
// tightening them is a separate change with its own test pass.

interface Props {
  activeService: string;
  accent: ServiceTokens;
  addRecentSearch: any;
  clearRecentSearches: () => void;
  insets: EdgeInsets;
  isSearchVisible: boolean;
  isSearching: boolean;
  listData: any[];
  recentSearches: any[];
  searchBackdropAnimatedStyle: any;
  searchBackdropOpacity: any;
  searchSheetAnimatedStyle: any;
  searchText: string;
  searchTranslateY: any;
  setIsSearchActive: React.Dispatch<React.SetStateAction<any>>;
  setSearchText: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeSearchOverlay(props: Props) {
  const { isSearchVisible, searchBackdropAnimatedStyle, searchBackdropOpacity, searchTranslateY, setIsSearchActive } = props;
  const inputRef = React.useRef<TextInput>(null);

  return (
    <Modal
      visible={isSearchVisible}
      animationType="none"
      transparent
      onRequestClose={() => setIsSearchActive(false)}
      onShow={() => {
        searchTranslateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
        searchBackdropOpacity.value = withTiming(1, { duration: 350 });
        // autoFocus alone doesn't raise the keyboard for an input mounted inside a
        // Modal on Android — the window isn't focusable yet when it fires — so the
        // sheet opened and the customer had to tap the field. Focus once the modal
        // window is actually up instead.
        requestAnimationFrame(() => inputRef.current?.focus());
      }}
    >
      <View style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }, searchBackdropAnimatedStyle]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsSearchActive(false)} />
        </Animated.View>
        <HomeSearchOverlaySearchForDishes {...props} inputRef={inputRef} />
      </View>
    </Modal>
  );
}
