import { Text, TouchableOpacity } from "react-native";

// Moved out of app/meat-centers.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeQuickFilters: any;
  styles: any;
  toggleQuickFilter: any;
}

export function MeatQuickBody({
  activeQuickFilters,
  styles,
  toggleQuickFilter,
}: Props) {
  return (
    <>
    <TouchableOpacity
      style={[styles.chip, activeQuickFilters.has("fast") && styles.chipActive]}
      onPress={() => toggleQuickFilter("fast")}
    >
      <Text style={[styles.chipText, activeQuickFilters.has("fast") && styles.chipTextActive]}>Fast delivery</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.chip, activeQuickFilters.has("rating") && styles.chipActive]}
      onPress={() => toggleQuickFilter("rating")}
    >
      <Text style={[styles.chipText, activeQuickFilters.has("rating") && styles.chipTextActive]}>Ratings 4.0+</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.chip, activeQuickFilters.has("open") && styles.chipActive]}
      onPress={() => toggleQuickFilter("open")}
    >
      <Text style={[styles.chipText, activeQuickFilters.has("open") && styles.chipTextActive]}>Open now</Text>
    </TouchableOpacity>
    </>
  );
}
