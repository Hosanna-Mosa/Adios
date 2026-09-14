import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface StatItem {
  label: string;
  value: string;
  accent?: boolean;
}

export type PerformanceRange = "today" | "week";

interface PerformanceCardProps {
  stats: StatItem[];
  range?: PerformanceRange;
  onRangeChange?: (range: PerformanceRange) => void;
}

const RANGE_OPTIONS: { key: PerformanceRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
];

export function PerformanceCard({ stats, range = "week", onRangeChange }: PerformanceCardProps) {
  // The dropdown used to be a static label with no onPress at all, so tapping
  // "This Week" did nothing — it never switched the range or refetched anything.
  const [menuVisible, setMenuVisible] = useState(false);
  const activeLabel = RANGE_OPTIONS.find((o) => o.key === range)?.label ?? "This Week";
  const getIconForStat = (label: string) => {
    switch (label.toLowerCase()) {
      case 'trips':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#eefaff' }]}>
            <Feather name="navigation" size={18} color="#0ea5e9" />
          </View>
        );
      case 'balance':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#ebfaf0' }]}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color={Colors.success} />
          </View>
        );
      case 'this week':
      default:
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#fff5e6' }]}>
            <Feather name="trending-up" size={18} color="#f59e0b" />
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today&apos;s Performance</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setMenuVisible(true)}>
          <Text style={styles.dropdownText}>{activeLabel}</Text>
          <Feather name="chevron-down" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <View style={styles.statIconContainer}>
              {getIconForStat(stat.label)}
            </View>
            <Text style={styles.statValue}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <Modal statusBarTranslucent visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            {RANGE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onRangeChange?.(option.key);
                }}
              >
                <Text style={[styles.menuItemText, option.key === range && styles.menuItemTextActive]}>
                  {option.label}
                </Text>
                {option.key === range && <Feather name="check" size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.text,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  dropdownText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textMuted,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "flex-end",
    paddingTop: 110,
    paddingRight: 20,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 150,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.text,
  },
  menuItemTextActive: {
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
});
