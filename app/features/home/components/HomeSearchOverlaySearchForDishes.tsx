import { type RefObject } from "react";
import { ActivityIndicator, Dimensions, FlatList, ScrollView, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import Animated, { Easing, withTiming } from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { DishSearchResultItem } from "./DishSearchResultItem";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { HomeSearchOverlaySearchForDishesRECENTLYSEARCHED } from "./HomeSearchOverlaySearchForDishesRECENTLYSEARCHED";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HomeStyles } from "@/features/home/home.styles";

// Section of HomeSearchOverlay, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  activeService: string;
  accent: ServiceTokens;
  addRecentSearch: any;
  inputRef: RefObject<TextInput | null>;
  clearRecentSearches: () => void;
  insets: EdgeInsets;
  isSearching: boolean;
  listData: any[];
  recentSearches: any[];
  searchSheetAnimatedStyle: any;
  searchText: string;
  setIsSearchActive: React.Dispatch<React.SetStateAction<any>>;
  setSearchText: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeSearchOverlaySearchForDishes(props: Props) {
  const { addRecentSearch, inputRef, insets, searchSheetAnimatedStyle, searchText, setIsSearchActive, setSearchText, styles, tokens } = props;
  const { t } = useTranslation();
  return (
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
        <Text style={styles.searchSheetHeaderText}>{t("app.home.searchForDishesRestaurants")}</Text>
      </View>

      <View style={styles.searchSheetInputRow}>
        <View style={styles.searchSheetInputWrap}>
          <Ionicons name="search" size={moderateScale(18)} color={tokens.muted} />
          <TextInput
            ref={inputRef}
            style={styles.searchSheetInput}
            placeholder={t("app.home.tryBawarchi")}
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

      <HomeSearchOverlaySearchForDishesRECENTLYSEARCHED {...props} />
    </Animated.View>
  );
}
