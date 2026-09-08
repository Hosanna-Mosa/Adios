import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { suggestionStyles as styles } from "./AddressSuggestions.styles";

export interface AddressSuggestion {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

/** Place-autocomplete dropdown under the address field.
 * Renders nothing when there is nothing to suggest. */
export function AddressSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: AddressSuggestion[];
  onSelect: (item: AddressSuggestion) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.dropdown}>
      <ScrollView nestedScrollEnabled={true} style={styles.scroll}>
        {suggestions.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => onSelect(item)} style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
