import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { HomeFilterSORTBYSORTBYRATINGS } from "./HomeFilterSORTBYSORTBYRATINGS";
import { HomeFilterSORTBYSORTBYCUISINES } from "./HomeFilterSORTBYSORTBYCUISINES";

// Section of HomeFilterSORTBY, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: any;
  activeFilterTab: any;
  availableCuisines: any[];
  filter99Store: any;
  filterCostRange: any;
  filterFastDelivery: any;
  filterMinRating: any;
  filterOffers: any;
  filterOpenNow: any;
  filterVegNonVeg: any;
  selectedCuisines: any[];
  selectedSort: any;
  setFilter99Store: React.Dispatch<React.SetStateAction<any>>;
  setFilterCostRange: React.Dispatch<React.SetStateAction<any>>;
  setFilterFastDelivery: React.Dispatch<React.SetStateAction<any>>;
  setFilterMinRating: React.Dispatch<React.SetStateAction<any>>;
  setFilterOffers: React.Dispatch<React.SetStateAction<any>>;
  setFilterOpenNow: React.Dispatch<React.SetStateAction<any>>;
  setFilterVegNonVeg: React.Dispatch<React.SetStateAction<any>>;
  setSelectedCuisines: React.Dispatch<React.SetStateAction<any>>;
  setSelectedSort: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  tokens: any;
}

export function HomeFilterSORTBYSORTBY(props: Props) {
  const { accent, activeFilterTab, filter99Store, filterFastDelivery, filterOffers, filterOpenNow, selectedSort, setFilter99Store, setFilterFastDelivery, setFilterOffers, setFilterOpenNow, setSelectedSort, styles, tokens } = props;
  return (
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
      <HomeFilterSORTBYSORTBYRATINGS {...props} />
      <HomeFilterSORTBYSORTBYCUISINES {...props} />
    </ScrollView>
  );
}
