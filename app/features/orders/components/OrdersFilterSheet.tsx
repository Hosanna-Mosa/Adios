import React from "react";
import { Modal, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "@/features/orders/orders.styles";
import type { Order } from "@/types/models";
import { SERVICE_CHIPS, isChipActive } from "../useOrders.shared";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
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
  const { t } = useTranslation();
  return (
    <Modal visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.sheetScrim} activeOpacity={1} onPress={() => setShowFilterSheet(false)} />
        <View style={styles.filterSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.filterSheetTitle}>{t("app.orders.filterOrders")}</Text>
          <Text style={styles.sectionLabel}>{t("app.orders.service")}</Text>
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
                  <Text style={styles.filterOptionLabel}>{t(chip.labelKey, { defaultValue: chip.label })}</Text>
                  <Text style={styles.filterOptionCount}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.clearBtn} onPress={() => setPendingServiceFilters(new Set())}>
              <Text style={styles.clearBtnText}>{t("app.orders.clearAll")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.showBtn, { backgroundColor: tokens.brand }]} onPress={applyFilters}>
              <Text style={[styles.showBtnText, { color: tokens.onBrand }]}>{t("app.orders.showOrdersCount", { count: pendingCount })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
