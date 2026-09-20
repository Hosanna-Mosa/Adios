import { IndexSection4 } from "@/features/home/components/IndexSection4";

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

export function IndexSection6({
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
    <IndexSection4
      tokens={tokens}
      accent={accent}
      styles={styles}
      selectedSort={selectedSort}
      setSelectedSort={setSelectedSort}
      filter99Store={filter99Store}
      setFilter99Store={setFilter99Store}
      filterFastDelivery={filterFastDelivery}
      setFilterFastDelivery={setFilterFastDelivery}
      filterOffers={filterOffers}
      setFilterOffers={setFilterOffers}
      filterMinRating={filterMinRating}
      setFilterMinRating={setFilterMinRating}
      filterOpenNow={filterOpenNow}
      setFilterOpenNow={setFilterOpenNow}
      filterCostRange={filterCostRange}
      setFilterCostRange={setFilterCostRange}
      filterVegNonVeg={filterVegNonVeg}
      setFilterVegNonVeg={setFilterVegNonVeg}
      selectedCuisines={selectedCuisines}
      setSelectedCuisines={setSelectedCuisines}
      activeFilterTab={activeFilterTab}
      setActiveFilterTab={setActiveFilterTab}
      isFilterModalVisible={isFilterModalVisible}
      setIsFilterModalVisible={setIsFilterModalVisible}
      filteredAndSortedItems={filteredAndSortedItems}
      availableCuisines={availableCuisines}
      clearAllFilters={clearAllFilters}
    />
  );
}
