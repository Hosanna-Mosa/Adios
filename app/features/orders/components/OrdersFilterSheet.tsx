import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { StatusBarFill } from "@/components/StatusBarFill";
import { Ionicons } from "@expo/vector-icons";
import { SERVICE_CHIPS, isChipActive } from "@/features/orders/useOrders.shared";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  applyFilters: any;
  orders: any;
  pendingCount: any;
  pendingServiceFilters: any;
  serviceCounts: any;
  setPendingServiceFilters: React.Dispatch<React.SetStateAction<any>>;
  setShowFilterSheet: React.Dispatch<React.SetStateAction<any>>;
  showFilterSheet: any;
  styles: any;
  toggleServiceFilter: any;
  tokens: any;
}

export function OrdersFilterSheet({
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
    <Modal statusBarTranslucent visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
      <StatusBarFill />
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.sheetScrim} activeOpacity={1} onPress={() => setShowFilterSheet(false)} />
        <View style={styles.filterSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.filterSheetTitle}>Filter orders</Text>
          <Text style={styles.sectionLabel}>Service</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {SERVICE_CHIPS.map((chip) => {
              const isSelected = isChipActive(pendingServiceFilters, chip.keys);
              const accent = tokens.services[chip.accent];
              // Ride covers four stored service types, so its count is their sum.
              const count = chip.keys.reduce((sum, k) => sum + (serviceCounts[k] || 0), 0);
              return (
                <TouchableOpacity
                  key={chip.label}
                  style={[styles.filterOptionRow, isSelected && { borderColor: accent.accent, backgroundColor: accent.skin }]}
                  onPress={() => toggleServiceFilter(chip.keys)}
                >
                  <View style={[styles.checkbox, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}>
                    {isSelected && <Ionicons name="checkmark" size={13} color={accent.on} />}
                  </View>
                  <Text style={styles.filterOptionLabel}>{chip.label}</Text>
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
