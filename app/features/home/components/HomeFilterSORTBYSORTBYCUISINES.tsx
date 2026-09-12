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
  availableCuisines: any[];
  selectedCuisines: any[];
  setSelectedCuisines: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeFilterSORTBYSORTBYCUISINES({
  accent,
  activeFilterTab,
  availableCuisines,
  selectedCuisines,
  setSelectedCuisines,
  styles,
  tokens,
}: Props) {
  return (
    <>
    {activeFilterTab === "Cuisines" && (
      <View>
        <Text style={styles.filterSectionTitle}>CUISINES</Text>
        {availableCuisines.length === 0 ? (
          <Text style={styles.filterEmptyNote}>No cuisines available in current location.</Text>
        ) : (
          availableCuisines.map((cuisine) => {
            const isSelected = selectedCuisines.includes(cuisine);
            return (
              <TouchableOpacity
                key={cuisine}
                style={styles.filterOptionRow}
                onPress={() => setSelectedCuisines(isSelected ? selectedCuisines.filter((c) => c !== cuisine) : [...selectedCuisines, cuisine])}
              >
                <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={moderateScale(18)} color={isSelected ? accent.accent : tokens.muted} />
                <Text style={[styles.filterOptionLabel, isSelected && { color: accent.accent, fontFamily: fontFamilies.body.bold }]}>{cuisine}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    )}
    </>
  );
}
