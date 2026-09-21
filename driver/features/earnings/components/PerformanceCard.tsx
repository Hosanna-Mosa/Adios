import React from "react";
import { StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { Touchable } from "@/components/ui/Touchable";

interface StatItem {
  label: string;
  value: string;
  accent?: boolean;
}

interface PerformanceCardProps {
  stats: StatItem[];
}

export function PerformanceCard({ stats }: PerformanceCardProps) {
  const getIconForStat = (label: string) => {
    switch (label.toLowerCase()) {
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
      case 'this week':
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
        <AppText style={styles.title}>Today&apos;s Performance</AppText>
        <Touchable style={styles.dropdown}>
          <AppText style={styles.dropdownText}>This Week</AppText>
          <Feather name="chevron-down" size={14} color={Colors.textSecondary} />
        </Touchable>
      </Box>
      <Box style={styles.statsRow}>
        {stats.map((stat) => (
          <Box key={stat.label} style={styles.statItem}>
            <Box style={styles.statIconContainer}>
              {getIconForStat(stat.label)}
            </Box>
            <AppText style={styles.statValue}>
              {stat.value}
            </AppText>
            <AppText style={styles.statLabel}>{stat.label}</AppText>
          </Box>
        ))}
      </Box>
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
});
