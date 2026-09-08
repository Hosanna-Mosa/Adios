import { ScrollView, Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleSelectSearchResult: any;
  insets: any;
  searchResults: any[];
  styles: any;
}

export function AddAddressSearchResults({
  handleSelectSearchResult,
  insets,
  searchResults,
  styles,
}: Props) {
  return (
    <ScrollView style={[styles.searchResults, { top: insets.top + 62 }]} keyboardShouldPersistTaps="handled">
      {searchResults.map((item, i) => (
        <Animated.View key={item.id} entering={staggerListItem(i, 25)}>
          <TouchableOpacity style={styles.searchResultRow} onPress={() => handleSelectSearchResult(item)}>
            <Text style={styles.searchResultName}>{item.name}</Text>
            <Text style={styles.searchResultAddr} numberOfLines={1}>{item.address}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
