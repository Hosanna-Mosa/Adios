import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { HomeFilterSORTBYSORTBY } from "./HomeFilterSORTBYSORTBY";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Section of HomeFilter, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: ServiceTokens;
  activeFilterTab: string;
  availableCuisines: any[];
  clearAllFilters: () => void;
  filter99Store: boolean;
  filterCostRange: string;
  filterFastDelivery: boolean;
  filterMinRating: number;
  filterOffers: boolean;
  filterOpenNow: boolean;
  filterVegNonVeg: string;
  filteredAndSortedItems: any;
  selectedCuisines: any[];
  selectedSort: string;
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
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeFilterSORTBY(props: Props) {
  const { activeFilterTab, clearAllFilters, filter99Store, filterCostRange, filterFastDelivery, filterMinRating, filterOffers, filterOpenNow, filterVegNonVeg, filteredAndSortedItems, selectedCuisines, selectedSort, setActiveFilterTab, setIsFilterModalVisible, styles } = props;
  const { t } = useTranslation();
  return (
    <>
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

      <HomeFilterSORTBYSORTBY {...props} />
    </View>

    <View style={styles.filterModalFooter}>
      <TouchableOpacity style={styles.filterModalClearBtn} onPress={clearAllFilters}>
        <Text style={styles.filterModalClearText}>{t("app.home.clearFilters")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterModalApplyBtn} onPress={() => setIsFilterModalVisible(false)}>
        <Text style={styles.filterModalApplyText}>
          {t("app.home.apply")} · {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? "result" : "results"}
        </Text>
      </TouchableOpacity>
    </View>
    </>
  );
}
