import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { HomeFilterSORTBY } from "./HomeFilterSORTBY";

// Section of HomeFilterModal, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

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

export function HomeFilter(props: Props) {
  const { setIsFilterModalVisible, styles, tokens } = props;
  return (
    <View style={styles.filterModalContent}>
      <View style={styles.filterModalHeader}>
        <Text style={styles.filterModalTitle}>Filter</Text>
        <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.filterModalCloseBtn}>
          <Ionicons name="close" size={moderateScale(22)} color={tokens.text} />
        </TouchableOpacity>
      </View>

      <HomeFilterSORTBY {...props} />
    </View>
  );
}
