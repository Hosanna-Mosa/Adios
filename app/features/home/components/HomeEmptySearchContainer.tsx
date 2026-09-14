import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  tryInstead: any[];
  hasActiveFilters: any;
  activeFilterCount: any;
  clearAllFilters: any;
  searchText: any;
  setSearchText: any;
  styles: any;
  tokens: any;
}

export function HomeEmptySearchContainer({
  tryInstead,
  hasActiveFilters,
  activeFilterCount,
  clearAllFilters,
  searchText,
  setSearchText,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.emptySearchContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="search-outline" size={26} color={tokens.sec} />
      </View>
      <Text style={styles.emptySearchTitle}>{t("app.home.noResultsFound")}</Text>
      <Text style={styles.emptySearchSubtitle}>
        {hasActiveFilters
          ? t("app.home.nothingMatchesVarWithFilterCount", { value: searchText, count: activeFilterCount })
          : t("app.home.weCouldntFindAnyOutletsMatchingVar", { value: searchText })}
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity style={styles.noServiceButton} onPress={clearAllFilters}>
          <Text style={styles.noServiceButtonText}>{t("app.home.clearFilters")}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.tryInsteadLabel}>{t("app.home.tryInstead")}</Text>
      <View style={styles.tryInsteadRow}>
        {tryInstead.map((term) => (
          <TouchableOpacity key={term} style={styles.tryInsteadChip} onPress={() => setSearchText(term)}>
            <Text style={styles.tryInsteadChipText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
