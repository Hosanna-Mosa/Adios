import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type ServiceKey, type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "@/features/orders/orders.styles";
import type { Order } from "@/types/models";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  SERVICE_META: Record<string, { label: string; accent: ServiceKey }>;
  applyFilters: any;
  orders: Order[];
  pendingCount: number;
  pendingServiceFilters: any;
  serviceCounts: any;
  setPendingServiceFilters: React.Dispatch<React.SetStateAction<any>>;
  setShowFilterSheet: React.Dispatch<React.SetStateAction<any>>;
  showFilterSheet: boolean;
  styles: OrdersStyles;
  toggleServiceFilter: any;
  tokens: ThemeTokens;
}

export function OrdersFilterSheet({
  SERVICE_META,
  applyFilters,
  orders,
  pendingCount,
  pendingServiceFilters,
  serviceCounts,
  setPendingServiceFilters,
  setShowFilterSheet,
  showFilterSheet,
  styles,
  toggleServiceFilter,
  tokens,
}: Props) {
  return (
    <Modal visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.sheetScrim} activeOpacity={1} onPress={() => setShowFilterSheet(false)} />
        <View style={styles.filterSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.filterSheetTitle}>Filter orders</Text>
          <Text style={styles.sectionLabel}>Service</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {Object.entries(SERVICE_META).filter(([k]) => k !== "bike" && k !== "auto" && k !== "cab" && k !== "cab_prime").map(([key, meta]) => {
              const isSelected = pendingServiceFilters.has(key);
              const accent = tokens.services[meta.accent];
              const count = serviceCounts[key] || 0;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterOptionRow, isSelected && { borderColor: accent.accent, backgroundColor: accent.skin }]}
                  onPress={() => toggleServiceFilter(key)}
                >
                  <View style={[styles.checkbox, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}>
                    {isSelected && <Ionicons name="checkmark" size={13} color={accent.on} />}
                  </View>
                  <Text style={styles.filterOptionLabel}>{meta.label}</Text>
                  <Text style={styles.filterOptionCount}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.clearBtn} onPress={() => setPendingServiceFilters(new Set())}>
              <Text style={styles.clearBtnText}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.showBtn, { backgroundColor: tokens.brand }]} onPress={applyFilters}>
              <Text style={[styles.showBtnText, { color: tokens.onBrand }]}>Show {pendingCount} orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
