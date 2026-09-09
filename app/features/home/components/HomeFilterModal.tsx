import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { HomeFilter } from "./HomeFilter";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it
// used to read from the screen's scope is now a prop of the same name, so
// the markup did not have to be touched. Props are typed loosely because
// this is a faithful lift-and-shift and the screen is the only caller --
// tightening them is a separate change with its own test pass.

interface Props {
  accent: any;
  activeFilterTab: any;
  availableCuisines: any[];
  clearAllFilters: any;
  filter99Store: any;
  filterCostRange: any;
  filterFastDelivery: any;
  filterMinRating: any;
  filterOffers: any;
  filterOpenNow: any;
  filterVegNonVeg: any;
  filteredAndSortedItems: any;
  isFilterModalVisible: any;
  selectedCuisines: any[];
  selectedSort: any;
  setActiveFilterTab: React.Dispatch<React.SetStateAction<any>>;
  setFilter99Store: React.Dispatch<React.SetStateAction<any>>;
  setFilterCostRange: React.Dispatch<React.SetStateAction<any>>;
  setFilterFastDelivery: React.Dispatch<React.SetStateAction<any>>;
  setFilterMinRating: React.Dispatch<React.SetStateAction<any>>;
  setFilterOffers: React.Dispatch<React.SetStateAction<any>>;
  setFilterOpenNow: React.Dispatch<React.SetStateAction<any>>;
  setFilterVegNonVeg: React.Dispatch<React.SetStateAction<any>>;
  setIsFilterModalVisible: React.Dispatch<React.SetStateAction<any>>;
  setSelectedCuisines: React.Dispatch<React.SetStateAction<any>>;
  setSelectedSort: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  tokens: any;
}

export function HomeFilterModal(props: Props) {
  const { isFilterModalVisible, setIsFilterModalVisible, styles } = props;
  return (
    <Modal visible={isFilterModalVisible} transparent animationType="slide" onRequestClose={() => setIsFilterModalVisible(false)}>
      <View style={styles.filterModalOverlay}>
        <TouchableOpacity style={styles.filterModalScrim} activeOpacity={1} onPress={() => setIsFilterModalVisible(false)} />
        <HomeFilter {...props} />
      </View>
    </Modal>
  );
}
