import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";
import { useTranslation } from "react-i18next";

// Section of HomeFilterSORTBYSORTBY, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: ServiceTokens;
  activeFilterTab: string;
  filterCostRange: string;
  filterMinRating: number;
  filterVegNonVeg: string;
  setFilterCostRange: React.Dispatch<React.SetStateAction<any>>;
  setFilterMinRating: React.Dispatch<React.SetStateAction<any>>;
  setFilterVegNonVeg: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeFilterSORTBYSORTBYRATINGS({
  accent,
  activeFilterTab,
  filterCostRange,
  filterMinRating,
  filterVegNonVeg,
  setFilterCostRange,
  setFilterMinRating,
  setFilterVegNonVeg,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    {activeFilterTab === "Ratings" && (
      <View>
        <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.ratings")}</Text>
        {[
          { value: 0, label: t("app.home.filterModal.showAll") },
          { value: 3, label: t("app.home.filterModal.ratingsPlus", { value: "3.0" }) },
          { value: 3.5, label: t("app.home.filterModal.ratingsPlus", { value: "3.5" }) },
          { value: 4, label: t("app.home.filterModal.ratingsPlus", { value: "4.0" }) },
          { value: 4.5, label: t("app.home.filterModal.ratingsPlus", { value: "4.5" }) },
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
        <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.costForTwo")}</Text>
        {[
          { id: "all", label: t("app.home.filterModal.showAll") },
          { id: "under300", label: t("app.home.filterModal.cost.under300") },
          { id: "300to600", label: t("app.home.filterModal.cost.between300And600") },
          { id: "over600", label: t("app.home.filterModal.cost.over600") },
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
        <Text style={styles.filterSectionTitle}>{t("app.home.filterModal.sections.dietaryPreference")}</Text>
        {[
          { id: "all", label: t("app.home.filterModal.showAll") },
          { id: "veg", label: t("app.home.filterModal.diet.pureVeg") },
          { id: "nonveg", label: t("app.home.filterModal.diet.nonVeg") },
        ].map((opt) => (
          <TouchableOpacity key={opt.id} style={styles.filterOptionRow} onPress={() => setFilterVegNonVeg(opt.id)}>
            <Ionicons name={filterVegNonVeg === opt.id ? "radio-button-on" : "radio-button-off"} size={moderateScale(18)} color={filterVegNonVeg === opt.id ? accent.accent : tokens.muted} />
            <Text style={[styles.filterOptionLabel, filterVegNonVeg === opt.id && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
    </>
  );
}
