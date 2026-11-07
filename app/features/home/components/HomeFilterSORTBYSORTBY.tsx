import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { HomeFilterSORTBYSORTBYRATINGS } from "./HomeFilterSORTBYSORTBYRATINGS";
import { HomeFilterSORTBYSORTBYCUISINES } from "./HomeFilterSORTBYSORTBYCUISINES";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Section of HomeFilterSORTBY, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: ServiceTokens;
  activeFilterTab: string;
  availableCuisines: any[];
  filter99Store: boolean;
  filterCostRange: string;
  filterFastDelivery: boolean;
  filterMinRating: number;
  filterOffers: boolean;
  filterOpenNow: boolean;
  filterVegNonVeg: string;
  selectedCuisines: any[];
  selectedSort: string;
  setFilter99Store: React.Dispatch<React.SetStateAction<any>>;
  setFilterCostRange: React.Dispatch<React.SetStateAction<any>>;
  setFilterFastDelivery: React.Dispatch<React.SetStateAction<any>>;
  setFilterMinRating: React.Dispatch<React.SetStateAction<any>>;
  setFilterOffers: React.Dispatch<React.SetStateAction<any>>;
  setFilterOpenNow: React.Dispatch<React.SetStateAction<any>>;
  setFilterVegNonVeg: React.Dispatch<React.SetStateAction<any>>;
  setSelectedCuisines: React.Dispatch<React.SetStateAction<any>>;
  setSelectedSort: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeFilterSORTBYSORTBY(props: Props) {
  const { accent, activeFilterTab, filter99Store, filterFastDelivery, filterOffers, filterOpenNow, selectedSort, setFilter99Store, setFilterFastDelivery, setFilterOffers, setFilterOpenNow, setSelectedSort, styles, tokens } = props;
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.filterModalRightPane} contentContainerStyle={{ padding: 16 }}>
      {activeFilterTab === "Sort" && (
        <View>
          <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.sortBy")}</Text>
          {[
            { id: "relevance", label: t("app.home.filterModal.sort.relevance") },
            { id: "distance", label: t("app.home.filterModal.sort.distance") },
            { id: "time", label: t("app.home.filterModal.sort.time") },
            { id: "rating", label: t("app.home.filterModal.sort.rating") },
            { id: "costLowHigh", label: t("app.home.filterModal.sort.costLowHigh") },
            { id: "costHighLow", label: t("app.home.filterModal.sort.costHighLow") },
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
          <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.store149Partners")}</Text>
          <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilter99Store(!filter99Store)}>
            <Ionicons name={filter99Store ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filter99Store ? accent.accent : tokens.muted} />
            <Text style={[styles.filterOptionLabel, filter99Store && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{t("app.home.show149StorePartners")}</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilterTab === "15mins" && (
        <View>
          <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.deliveryTime")}</Text>
          <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterFastDelivery(!filterFastDelivery)}>
            <Ionicons name={filterFastDelivery ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filterFastDelivery ? accent.accent : tokens.muted} />
            <Text style={[styles.filterOptionLabel, filterFastDelivery && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{t("app.home.fastDeliveryUnder30Mins")}</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilterTab === "OpenNow" && (
        <View>
          <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.availability")}</Text>
          <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterOpenNow(!filterOpenNow)}>
            <Ionicons name={filterOpenNow ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filterOpenNow ? accent.accent : tokens.muted} />
            <Text style={[styles.filterOptionLabel, filterOpenNow && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{t("app.home.openNowOnly")}</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilterTab === "Offers" && (
        <View>
          <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.offers")}</Text>
          <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterOffers(!filterOffers)}>
            <Ionicons name={filterOffers ? "checkbox" : "square-outline"} size={moderateScale(18)} color={filterOffers ? accent.accent : tokens.muted} />
            <Text style={[styles.filterOptionLabel, filterOffers && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{t("app.home.freeDeliverySpecialOffers")}</Text>
          </TouchableOpacity>
        </View>
      )}
      <HomeFilterSORTBYSORTBYRATINGS {...props} />
      <HomeFilterSORTBYSORTBYCUISINES {...props} />
    </ScrollView>
  );
}
