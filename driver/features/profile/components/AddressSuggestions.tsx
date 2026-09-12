import React from "react";

import { suggestionStyles as styles } from "./AddressSuggestions.styles";
import { Touchable } from "@/components/ui/Touchable";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <Box style={styles.dropdown}>
      <ScrollBox nestedScrollEnabled={true} style={styles.scroll}>
        {suggestions.map((item) => (
          <Touchable key={item.id} onPress={() => onSelect(item)} style={styles.row}>
            <AppText style={styles.name}>{item.name}</AppText>
            <AppText style={styles.address}>{item.address}</AppText>
          </Touchable>
        ))}
      </ScrollBox>
    </Box>
  );
}
