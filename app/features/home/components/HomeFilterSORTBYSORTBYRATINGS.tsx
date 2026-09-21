import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontFamilies } from "@/constants/typography";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

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
  return (
    <>
    {activeFilterTab === "Ratings" && (
      <View>
        <Text style={styles.filterSectionTitle}>RATINGS</Text>
        {[
          { value: 0, label: "Show all" },
          { value: 3, label: "Ratings 3.0+" },
          { value: 3.5, label: "Ratings 3.5+" },
          { value: 4, label: "Ratings 4.0+" },
          { value: 4.5, label: "Ratings 4.5+" },
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
        <Text style={styles.filterSectionTitle}>COST FOR TWO</Text>
        {[
          { id: "all", label: "Show all" },
          { id: "under300", label: "Less than ₹300" },
          { id: "300to600", label: "₹300 – ₹600" },
          { id: "over600", label: "More than ₹600" },
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
        <Text style={styles.filterSectionTitle}>DIETARY PREFERENCE</Text>
        {[
          { id: "all", label: "Show all" },
          { id: "veg", label: "Pure veg" },
          { id: "nonveg", label: "Non-veg" },
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
