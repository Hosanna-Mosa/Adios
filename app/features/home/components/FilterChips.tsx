import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";
import { translateFoodTag } from "@/i18n/foodTagLabels";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from
// the screen's scope is now passed in as props.

interface Props {
  styles: any;
  accent: ServiceTokens;
  activeService: string;
  activeFilterCount: number;
  filterMinRating: number;
  filterOpenNow: boolean;
  filterCostRange: string;
  filterFastDelivery: boolean;
  filterOffers: boolean;
  filterVegNonVeg: string;
  setFilterMinRating: (v: number) => void;
  setFilterOpenNow: (v: boolean) => void;
  setFilterFastDelivery: (v: boolean) => void;
  setFilterOffers: (v: boolean) => void;
  setFilterVegNonVeg: (v: string) => void;
  setActiveFilterTab: (v: string) => void;
  setIsFilterModalVisible: (v: boolean) => void;
  setFilterCostRange: (v: string) => void;
  setSelectedCuisines: (v: string[]) => void;
  selectedCuisines: string[];
}

export function FilterChips({
  styles,
  accent,
  activeService,
  activeFilterCount,
  filterMinRating,
  filterOpenNow,
  filterCostRange,
  filterFastDelivery,
  filterOffers,
  filterVegNonVeg,
  setFilterMinRating,
  setFilterOpenNow,
  setFilterFastDelivery,
  setFilterOffers,
  setFilterVegNonVeg,
  setActiveFilterTab,
  setIsFilterModalVisible,
  setFilterCostRange,
  setSelectedCuisines,
  selectedCuisines,
}: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScrollContent}>
      <TouchableOpacity
        style={[styles.chip, styles.chipFilled]}
        onPress={() => { setActiveFilterTab("Sort"); setIsFilterModalVisible(true); }}
      >
        <Text style={styles.chipFilledText}>{t("app.home.filter")}</Text>
        <Ionicons name="options-outline" size={moderateScale(13)} color={accent.on} style={{ marginLeft: 4 }} />
        {activeFilterCount > 0 && (
          <View style={styles.chipBadge}><Text style={styles.chipBadgeText}>{activeFilterCount}</Text></View>
        )}
      </TouchableOpacity>

      {activeService === "Meat" ? (
        <>
          <TouchableOpacity style={[styles.chip, filterFastDelivery && styles.chipActive]} onPress={() => setFilterFastDelivery(!filterFastDelivery)}>
            <Text style={[styles.chipText, filterFastDelivery && styles.chipTextActive]}>{t("app.home.fastDelivery")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, filterMinRating === 4 && styles.chipActive]} onPress={() => setFilterMinRating(filterMinRating === 4 ? 0 : 4)}>
            <Text style={[styles.chipText, filterMinRating === 4 && styles.chipTextActive]}>{t("app.home.ratings40")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, filterOpenNow && styles.chipActive]} onPress={() => setFilterOpenNow(!filterOpenNow)}>
            <Text style={[styles.chipText, filterOpenNow && styles.chipTextActive]}>{t("app.home.openNow")}</Text>
          </TouchableOpacity>
          {["Chicken", "Mutton"].map((meatType) => {
            const isSelected = selectedCuisines.includes(meatType);
            return (
              <TouchableOpacity
                key={meatType}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedCuisines(isSelected ? selectedCuisines.filter((c) => c !== meatType) : [...selectedCuisines, meatType])}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{translateFoodTag(meatType, t)}</Text>
              </TouchableOpacity>
            );
          })}
        </>
      ) : (
        <>
          <TouchableOpacity style={[styles.chip, filterOpenNow && styles.chipActive]} onPress={() => setFilterOpenNow(!filterOpenNow)}>
            <Text style={[styles.chipText, filterOpenNow && styles.chipTextActive]}>{t("app.home.openNow")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, filterOffers && styles.chipActive]} onPress={() => setFilterOffers(!filterOffers)}>
            <Text style={[styles.chipText, filterOffers && styles.chipTextActive]}>{t("app.home.offers")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, filterMinRating === 4 && styles.chipActive]} onPress={() => setFilterMinRating(filterMinRating === 4 ? 0 : 4)}>
            <Text style={[styles.chipText, filterMinRating === 4 && styles.chipTextActive]}>{t("app.home.ratings40")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filterCostRange === "300to600" && styles.chipActive]}
            onPress={() => setFilterCostRange(filterCostRange === "300to600" ? "all" : "300to600")}
          >
            <Text style={[styles.chipText, filterCostRange === "300to600" && styles.chipTextActive]}>₹300–₹600</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filterCostRange === "under300" && styles.chipActive]}
            onPress={() => setFilterCostRange(filterCostRange === "under300" ? "all" : "under300")}
          >
            <Text style={[styles.chipText, filterCostRange === "under300" && styles.chipTextActive]}>{t("app.home.under300")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filterVegNonVeg === "veg" && styles.chipActive]}
            onPress={() => setFilterVegNonVeg(filterVegNonVeg === "veg" ? "all" : "veg")}
          >
            <View style={styles.chipVegDot} />
            <Text style={[styles.chipText, filterVegNonVeg === "veg" && styles.chipTextActive]}>{t("app.home.pureVeg")}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
