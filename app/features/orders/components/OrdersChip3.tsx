import { Text, TouchableOpacity } from "react-native";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  serviceFilters: any;
  setServiceFilters: any;
  styles: any;
}

export function OrdersChip3({
  serviceFilters,
  setServiceFilters,
  styles,
}: Props) {
  return (
    <TouchableOpacity style={[styles.chip, serviceFilters.size === 0 && styles.chipActive]} onPress={() => setServiceFilters(new Set())}>
      <Text style={[styles.chipText, serviceFilters.size === 0 && styles.chipTextActive]}>All</Text>
    </TouchableOpacity>
  );
}
