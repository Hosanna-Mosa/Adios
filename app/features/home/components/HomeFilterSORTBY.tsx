import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { HomeFilterSORTBYSORTBY } from "./HomeFilterSORTBYSORTBY";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";
import { type EdgeInsets } from "react-native-safe-area-context";

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
  insets: EdgeInsets;
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
  const { activeFilterTab, clearAllFilters, filter99Store, filterCostRange, filterFastDelivery, filterMinRating, filterOffers, filterOpenNow, filterVegNonVeg, filteredAndSortedItems, insets, selectedCuisines, selectedSort, setActiveFilterTab, setIsFilterModalVisible, styles } = props;
  const { t } = useTranslation();
  return (
    <>
    <View style={styles.filterModalBody}>
      <ScrollView style={styles.filterModalLeftPane} showsVerticalScrollIndicator={false}>
        {[
          { id: "Sort", label: t("app.home.filterModal.tabs.sort") },
          { id: "99store", label: t("app.home.filterModal.tabs.store149") },
          { id: "15mins", label: t("app.home.filterModal.tabs.mins15") },
          { id: "OpenNow", label: t("app.home.openNow") },
          { id: "Offers", label: t("app.home.offers") },
          { id: "Ratings", label: t("app.home.filterModal.tabs.ratings") },
          { id: "CostForTwo", label: t("app.home.filterModal.tabs.costForTwo") },
          { id: "VegNonVeg", label: t("app.home.filterModal.tabs.vegNonVeg") },
          { id: "Cuisines", label: t("app.home.filterModal.tabs.cuisines") },
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
      </ScrollView>

      <HomeFilterSORTBYSORTBY {...props} />
    </View>

    <View style={[styles.filterModalFooter, { paddingBottom: 16 + insets.bottom }]}>
      <TouchableOpacity style={styles.filterModalClearBtn} onPress={clearAllFilters}>
        <Text style={styles.filterModalClearText}>{t("app.home.clearFilters")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterModalApplyBtn} onPress={() => setIsFilterModalVisible(false)}>
        <Text style={styles.filterModalApplyText}>
          {t("app.home.apply")} · {t("app.home.filterModal.resultCount", { count: filteredAndSortedItems.length })}
        </Text>
      </TouchableOpacity>
    </View>
    </>
  );
}
