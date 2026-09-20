import { Text, TouchableOpacity } from "react-native";
import { toggleChipKeys } from "@/features/orders/useOrders.shared";

// Moved out of app/(tabs)/orders.tsx.
//
// The service key arrives as `serviceKey`, not `key`: React consumes `key` for
// reconciliation and never passes it to the component, so this chip used to
// toggle `undefined` into the filter set and every filtered list came back empty.

interface Props {
  label: string;
  serviceKeys: string[];
  isActive: boolean;
  setServiceFilters: (updater: (prev: Set<string>) => Set<string>) => void;
  styles: any;
}

export function OrdersChip2({
  label,
  serviceKeys,
  isActive,
  setServiceFilters,
  styles,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={() => setServiceFilters((prev) => toggleChipKeys(prev, serviceKeys))}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
