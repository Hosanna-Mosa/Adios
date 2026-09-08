import React from "react";
import { Text, TouchableOpacity } from "react-native";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  meta: any;
  key: any;
  isActive: any;
  setServiceFilters: (updater: (prev: any) => any) => void;
  styles: any;
}

export function OrdersChip2({
  meta,
  key,
  isActive,
  setServiceFilters,
  styles,
}: Props) {
  return (
    <TouchableOpacity
      key={key}
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={() => setServiceFilters((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; })}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{meta.label}</Text>
    </TouchableOpacity>
  );
}
