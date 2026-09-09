import { HomeFilterModal } from "@/features/home/components/HomeFilterModal";

// Markup moved out of (tabs)/index.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  tokens: any;
  accent: any;
  styles: any;
  selectedSort: any;
  setSelectedSort: any;
  filter99Store: any;
  setFilter99Store: any;
  filterFastDelivery: any;
  setFilterFastDelivery: any;
  filterOffers: any;
  setFilterOffers: any;
  filterMinRating: any;
  setFilterMinRating: any;
  filterOpenNow: any;
  setFilterOpenNow: any;
  filterCostRange: any;
  setFilterCostRange: any;
  filterVegNonVeg: any;
  setFilterVegNonVeg: any;
  selectedCuisines: any;
  setSelectedCuisines: any;
  activeFilterTab: any;
  setActiveFilterTab: any;
  isFilterModalVisible: any;
  setIsFilterModalVisible: any;
  filteredAndSortedItems: any;
  availableCuisines: any;
  clearAllFilters: any;
}

export function IndexSection4({
  tokens,
  accent,
  styles,
  selectedSort,
  setSelectedSort,
  filter99Store,
  setFilter99Store,
  filterFastDelivery,
  setFilterFastDelivery,
  filterOffers,
  setFilterOffers,
  filterMinRating,
  setFilterMinRating,
  filterOpenNow,
  setFilterOpenNow,
  filterCostRange,
  setFilterCostRange,
  filterVegNonVeg,
  setFilterVegNonVeg,
  selectedCuisines,
  setSelectedCuisines,
  activeFilterTab,
  setActiveFilterTab,
  isFilterModalVisible,
  setIsFilterModalVisible,
  filteredAndSortedItems,
  availableCuisines,
  clearAllFilters,
}: Props) {
  return (
    <HomeFilterModal
      accent={accent}
      activeFilterTab={activeFilterTab}
      availableCuisines={availableCuisines}
      clearAllFilters={clearAllFilters}
      filter99Store={filter99Store}
      filterCostRange={filterCostRange}
      filterFastDelivery={filterFastDelivery}
      filterMinRating={filterMinRating}
      filterOffers={filterOffers}
      filterOpenNow={filterOpenNow}
      filterVegNonVeg={filterVegNonVeg}
      filteredAndSortedItems={filteredAndSortedItems}
      isFilterModalVisible={isFilterModalVisible}
      selectedCuisines={selectedCuisines}
      selectedSort={selectedSort}
      setActiveFilterTab={setActiveFilterTab}
      setFilter99Store={setFilter99Store}
      setFilterCostRange={setFilterCostRange}
      setFilterFastDelivery={setFilterFastDelivery}
      setFilterMinRating={setFilterMinRating}
      setFilterOffers={setFilterOffers}
      setFilterOpenNow={setFilterOpenNow}
      setFilterVegNonVeg={setFilterVegNonVeg}
      setIsFilterModalVisible={setIsFilterModalVisible}
      setSelectedCuisines={setSelectedCuisines}
      setSelectedSort={setSelectedSort}
      styles={styles}
      tokens={tokens}
    />
  );
}
