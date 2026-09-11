import { ActivityIndicator, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn } from "@/motion/presets";

import { moderateScale } from "react-native-size-matters";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  handleSearch: any;
  insets: any;
  router: any;
  searchInputRef: any;
  searchQuery: any;
  searching: any;
  styles: any;
  tokens: any;
}

export function AddAddressSearchRow({
  accent,
  handleSearch,
  insets,
  router,
  searchInputRef,
  searchQuery,
  searching,
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View style={[styles.searchRow, { top: insets.top + 10 }]} entering={fadeIn(0)}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={tokens.sec} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search for a new area, locality…"
          placeholderTextColor={tokens.muted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searching && <ActivityIndicator size="small" color={accent.accent} />}
      </View>
    </Animated.View>
  );
}
