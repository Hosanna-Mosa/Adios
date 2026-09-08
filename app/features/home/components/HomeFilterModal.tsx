import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";

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

export function HomeFilterModal({
  accent,
  activeFilterTab,
  availableCuisines,
  clearAllFilters,
  filter99Store,
  filterCostRange,
  filterFastDelivery,
  filterMinRating,
  filterOffers,
  filterOpenNow,
  filterVegNonVeg,
  filteredAndSortedItems,
  isFilterModalVisible,
  selectedCuisines,
  selectedSort,
  setActiveFilterTab,
  setFilter99Store,
  setFilterCostRange,
  setFilterFastDelivery,
  setFilterMinRating,
  setFilterOffers,
  setFilterOpenNow,
  setFilterVegNonVeg,
  setIsFilterModalVisible,
  setSelectedCuisines,
  setSelectedSort,
  styles,
  tokens,
}: Props) {
  return (
    <Modal visible={isFilterModalVisible} transparent animationType="slide" onRequestClose={() => setIsFilterModalVisible(false)}>
      <View style={styles.filterModalOverlay}>
        <TouchableOpacity style={styles.filterModalScrim} activeOpacity={1} onPress={() => setIsFilterModalVisible(false)} />
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter</Text>
            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.filterModalCloseBtn}>
              <Ionicons name="close" size={moderateScale(22)} color={tokens.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterModalBody}>
            <View style={styles.filterModalLeftPane}>
              {[
                { id: "Sort", label: "Sort" },
                { id: "99store", label: "149 Store" },
                { id: "15mins", label: "15 mins" },
                { id: "OpenNow", label: "Open now" },
                { id: "Offers", label: "Offers" },
                { id: "Ratings", label: "Ratings" },
                { id: "CostForTwo", label: "Cost for two" },
                { id: "VegNonVeg", label: "Veg/Non-Veg" },
                { id: "Cuisines", label: "Cuisines" },
              ].map((tab) => {
                const isActive = activeFilterTab === tab.id;
                let hasApplied = false;
                if (tab.id === "Sort" && selectedSort !== "relevance") hasApplied = true;
                if (tab.id === "99store" && filter99Store) hasApplied = true;
                if (tab.id === "15mins" && filterFastDelivery) hasApplied = true;
                if (tab.id === "OpenNow" && filterOpenNow) hasApplied = true;
                if (tab.id === "Offers" && filterOffers) hasApplied = true;
                if (tab.id === "Ratings" && filterMinRating > 0) hasApplied = true;
                if (tab.id === "CostForTwo" && filterCostRange !== "all") hasApplied = true;
                if (tab.id === "VegNonVeg" && filterVegNonVeg !== "all") hasApplied = true;
                if (tab.id === "Cuisines" && selectedCuisines.length > 0) hasApplied = true;
                return (
                  <TouchableOpacity key={tab.id} style={[styles.filterTabButton, isActive && styles.filterTabButtonActive]} onPress={() => setActiveFilterTab(tab.id)}>
                    {hasApplied && <View style={styles.filterTabIndicator} />}
                    <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView style={styles.filterModalRightPane} contentContainerStyle={{ padding: 16 }}>
              {activeFilterTab === "Sort" && (
                <View>
                  <Text style={styles.filterSectionTitle}>SORT BY</Text>
                  {[
                    { id: "relevance", label: "Relevance (Default)" },
                    { id: "distance", label: "Distance: Nearest first" },
                    { id: "time", label: "Delivery Time" },
                    { id: "rating", label: "Rating" },
                    { id: "costLowHigh", label: "Cost: Low to High" },
                    { id: "costHighLow", label: "Cost: High to Low" },
                  ].map((opt) => (
                    <TouchableOpacity key={opt.id} style={styles.filterOptionRow} onPress={() => setSelectedSort(opt.id)}>
                      <Ionicons name={selectedSort === opt.id ? "radio-button-on" : "radio-button-off"} size={moderateScale(18)} color={selectedSort === opt.id ? accent.accent : tokens.muted} />
                      <Text style={[styles.filterOptionLabel, selectedSort === opt.id && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeFilterTab === "99store" && (
                <View>
                  <Text style={styles.filterSectionTitle}>149 STORE PARTNERS</Text>
                  <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilter99Store(!filter99Store)}>
                    <Ionicons name={filter99Store ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filter99Store ? accent.accent : tokens.muted} />
                    <Text style={[styles.filterOptionLabel, filter99Store && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>Show 149 Store partners</Text>
                  </TouchableOpacity>
                </View>
              )}
              {activeFilterTab === "15mins" && (
                <View>
                  <Text style={styles.filterSectionTitle}>DELIVERY TIME</Text>
                  <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterFastDelivery(!filterFastDelivery)}>
                    <Ionicons name={filterFastDelivery ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filterFastDelivery ? accent.accent : tokens.muted} />
                    <Text style={[styles.filterOptionLabel, filterFastDelivery && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>Fast delivery (under 30 mins)</Text>
                  </TouchableOpacity>
                </View>
              )}
              {activeFilterTab === "OpenNow" && (
                <View>
                  <Text style={styles.filterSectionTitle}>AVAILABILITY</Text>
                  <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterOpenNow(!filterOpenNow)}>
                    <Ionicons name={filterOpenNow ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filterOpenNow ? accent.accent : tokens.muted} />
                    <Text style={[styles.filterOptionLabel, filterOpenNow && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>Open now only</Text>
                  </TouchableOpacity>
                </View>
              )}
              {activeFilterTab === "Offers" && (
                <View>
                  <Text style={styles.filterSectionTitle}>OFFERS</Text>
                  <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterOffers(!filterOffers)}>
                    <Ionicons name={filterOffers ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filterOffers ? accent.accent : tokens.muted} />
                    <Text style={[styles.filterOptionLabel, filterOffers && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>Free delivery / special offers</Text>
                  </TouchableOpacity>
                </View>
              )}
              {activeFilterTab === "Ratings" && (
                <View>
                  <Text style={styles.filterSectionTitle}>RATINGS</Text>
                  {[
                    { value: 0, label: "Show all" },
                    { value: 3, label: "Ratings 3.0+" },
                    { value: 3.5, label: "Ratings 3.5+" },
                    { value: 4, label: "Ratings 4.0+" },
                    { value: 4.5, label: "Ratings 4.5+" },
                  ].map((opt) => (
                    <TouchableOpacity key={opt.value} style={styles.filterOptionRow} onPress={() => setFilterMinRating(opt.value)}>
                      <Ionicons name={filterMinRating === opt.value ? "radio-button-on" : "radio-button-off"} size={moderateScale(18)} color={filterMinRating === opt.value ? accent.accent : tokens.muted} />
                      <Text style={[styles.filterOptionLabel, filterMinRating === opt.value && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeFilterTab === "CostForTwo" && (
                <View>
                  <Text style={styles.filterSectionTitle}>COST FOR TWO</Text>
                  {[
                    { id: "all", label: "Show all" },
                    { id: "under300", label: "Less than ₹300" },
                    { id: "300to600", label: "₹300 – ₹600" },
                    { id: "over600", label: "More than ₹600" },
                  ].map((opt) => (
                    <TouchableOpacity key={opt.id} style={styles.filterOptionRow} onPress={() => setFilterCostRange(opt.id)}>
                      <Ionicons name={filterCostRange === opt.id ? "radio-button-on" : "radio-button-off"} size={moderateScale(18)} color={filterCostRange === opt.id ? accent.accent : tokens.muted} />
                      <Text style={[styles.filterOptionLabel, filterCostRange === opt.id && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeFilterTab === "VegNonVeg" && (
                <View>
                  <Text style={styles.filterSectionTitle}>DIETARY PREFERENCE</Text>
                  {[
                    { id: "all", label: "Show all" },
                    { id: "veg", label: "Pure veg" },
                    { id: "nonveg", label: "Non-veg" },
                  ].map((opt) => (
                    <TouchableOpacity key={opt.id} style={styles.filterOptionRow} onPress={() => setFilterVegNonVeg(opt.id)}>
                      <Ionicons name={filterVegNonVeg === opt.id ? "radio-button-on" : "radio-button-off"} size={moderateScale(18)} color={filterVegNonVeg === opt.id ? accent.accent : tokens.muted} />
                      <Text style={[styles.filterOptionLabel, filterVegNonVeg === opt.id && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {activeFilterTab === "Cuisines" && (
                <View>
                  <Text style={styles.filterSectionTitle}>CUISINES</Text>
                  {availableCuisines.length === 0 ? (
                    <Text style={styles.filterEmptyNote}>No cuisines available in current location.</Text>
                  ) : (
                    availableCuisines.map((cuisine) => {
                      const isSelected = selectedCuisines.includes(cuisine);
                      return (
                        <TouchableOpacity
                          key={cuisine}
                          style={styles.filterOptionRow}
                          onPress={() => setSelectedCuisines(isSelected ? selectedCuisines.filter((c) => c !== cuisine) : [...selectedCuisines, cuisine])}
                        >
                          <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={moderateScale(18)} color={isSelected ? accent.accent : tokens.muted} />
                          <Text style={[styles.filterOptionLabel, isSelected && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{cuisine}</Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity style={styles.filterModalClearBtn} onPress={clearAllFilters}>
              <Text style={styles.filterModalClearText}>Clear filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterModalApplyBtn} onPress={() => setIsFilterModalVisible(false)}>
              <Text style={styles.filterModalApplyText}>
                Apply · {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? "result" : "results"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
