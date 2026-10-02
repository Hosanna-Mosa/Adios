import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { Touchable } from "@/components/ui/Touchable";
import { ModalBox } from "@/components/ui/ModalBox";
import { PressBox } from "@/components/ui/PressBox";

interface StatItem {
  /** Stable, untranslated identifier used only to pick the icon — never
   * displayed. Kept separate from `label` so icon selection still works once
   * `label` is a translated string. */
  kind: "trips" | "balance" | "thisWeek";
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

const RANGE_OPTIONS: { key: PerformanceRange; labelKey: string }[] = [
  { key: "today", labelKey: "earnings.today" },
  { key: "week", labelKey: "earnings.thisWeek" },
];

export function PerformanceCard({ stats, range = "week", onRangeChange }: PerformanceCardProps) {
  const { t } = useTranslation();
  // The dropdown used to be a static label with no onPress at all, so tapping
  // "This Week" did nothing — it never switched the range or refetched anything.
  const [menuVisible, setMenuVisible] = useState(false);
  const activeLabelKey = RANGE_OPTIONS.find((o) => o.key === range)?.labelKey ?? "earnings.thisWeek";
  const getIconForStat = (kind: StatItem["kind"]) => {
    switch (kind) {
      case 'trips':
        return (
          <Box style={[styles.iconCircle, { backgroundColor: '#eefaff' }]}>
            <Feather name="navigation" size={18} color="#0ea5e9" />
          </Box>
        );
      case 'balance':
        return (
          <Box style={[styles.iconCircle, { backgroundColor: '#ebfaf0' }]}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color={Colors.success} />
          </Box>
        );
      case 'thisWeek':
      default:
        return (
          <Box style={[styles.iconCircle, { backgroundColor: '#fff5e6' }]}>
            <Feather name="trending-up" size={18} color="#f59e0b" />
          </Box>
        );
    }
  };

  return (
    <Box style={styles.card}>
      <Box style={styles.header}>
        <AppText style={styles.title}>{t("earnings.todaysPerformance")}</AppText>
        <Touchable style={styles.dropdown} onPress={() => setMenuVisible(true)}>
          <AppText style={styles.dropdownText}>{t(activeLabelKey)}</AppText>
          <Feather name="chevron-down" size={14} color={Colors.textSecondary} />
        </Touchable>
      </Box>
      <Box style={styles.statsRow}>
        {stats.map((stat) => (
          <Box key={stat.kind} style={styles.statItem}>
            <Box style={styles.statIconContainer}>
              {getIconForStat(stat.kind)}
            </Box>
            <AppText style={styles.statValue}>
              {stat.value}
            </AppText>
            <AppText style={styles.statLabel}>{stat.label}</AppText>
          </Box>
        ))}
      </Box>
      <ModalBox visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <PressBox style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <Box style={styles.menuCard}>
            {RANGE_OPTIONS.map((option) => (
              <Touchable
                key={option.key}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onRangeChange?.(option.key);
                }}
              >
                <AppText style={[styles.menuItemText, option.key === range && styles.menuItemTextActive]}>
                  {t(option.labelKey)}
                </AppText>
                {option.key === range && <Feather name="check" size={16} color={Colors.primary} />}
              </Touchable>
            ))}
          </Box>
        </PressBox>
      </ModalBox>
    </Box>
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
    fontWeight: "700",
    fontSize: typography.sizes.medium,
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
    fontWeight: "500",
    fontSize: typography.sizes.small,
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
    fontWeight: "700",
    fontSize: typography.sizes.large,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontWeight: "500",
    fontSize: typography.sizes.small,
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
    fontWeight: "500",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  menuItemTextActive: {
    fontWeight: "700",
    color: Colors.primary,
  },
});
