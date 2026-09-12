import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { type OrdersStyles } from "@/features/orders/orders.styles";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.
//
// `serviceKey` carries the service id, NOT `key`: React reserves `key` for
// reconciliation and never forwards it to the component, so a prop by that name
// always arrived as undefined and every chip toggled the same `undefined` entry.

interface Props {
  meta: any;
  serviceKey: string;
  isActive: boolean;
  setServiceFilters: (updater: (prev: any) => any) => void;
  styles: OrdersStyles;
}

export function OrdersServiceChip({
  meta,
  serviceKey,
  isActive,
  setServiceFilters,
  styles,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={() => setServiceFilters((prev) => { const n = new Set(prev); n.has(serviceKey) ? n.delete(serviceKey) : n.add(serviceKey); return n; })}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{meta.label}</Text>
    </TouchableOpacity>
  );
}
