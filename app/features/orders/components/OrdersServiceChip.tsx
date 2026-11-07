import { Text, TouchableOpacity } from "react-native";
import { type OrdersStyles } from "@/features/orders/orders.styles";

// Moved out of app/(tabs)/orders.tsx.
//
// The service keys arrive as `serviceKeys`, NOT `key`: React reserves `key` for
// reconciliation and never forwards it to the component, so a prop by that name
// always arrived as undefined and every chip toggled the same `undefined` entry.
//
// One chip can stand for several stored service types (the four ride types are a
// single "Ride" chip), so it toggles all of its keys together — see SERVICE_CHIPS.

interface Props {
  label: string;
  serviceKeys: string[];
  isActive: boolean;
  setServiceFilters: (updater: (prev: Set<string>) => Set<string>) => void;
  styles: OrdersStyles;
}

export function OrdersServiceChip({
  label,
  serviceKeys,
  isActive,
  setServiceFilters,
  styles,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      // One service at a time: picking another replaces it; tapping it again goes back to All.
      onPress={() => setServiceFilters(() => (isActive ? new Set<string>() : new Set(serviceKeys)))}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
