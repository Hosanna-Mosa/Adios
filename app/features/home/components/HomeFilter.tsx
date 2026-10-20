import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { HomeFilterSORTBY } from "./HomeFilterSORTBY";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";
import { type EdgeInsets } from "react-native-safe-area-context";

// Section of HomeFilterModal, split out to keep every file under 150 lines.
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

export function HomeFilter(props: Props) {
  const { t } = useTranslation();
  const { setIsFilterModalVisible, styles, tokens } = props;
  return (
    <View style={styles.filterModalContent}>
      <View style={styles.filterModalHeader}>
        <Text style={styles.filterModalTitle}>Filter</Text>
        <TouchableOpacity
          onPress={() => setIsFilterModalVisible(false)}
          style={styles.filterModalCloseBtn}
          hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
          accessibilityRole="button"
          accessibilityLabel={t("app.support.closeModal")}
        >
          <Ionicons name="close" size={moderateScale(22)} color={tokens.text} />
        </TouchableOpacity>
      </View>

      <HomeFilterSORTBY {...props} />
    </View>
  );
}
