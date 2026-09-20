import React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

interface TransactionItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  amount: string;
  time?: string;
}

export function TransactionItem({ icon, label, amount, time }: TransactionItemProps) {
  const isPositive = amount.startsWith("+");

  return (
    <Box style={styles.container}>
      <Box style={styles.iconContainer}>
        <Feather name={icon} size={18} color={isPositive ? Colors.primary : Colors.textMuted} />
      </Box>
      <Box style={styles.details}>
        <AppText style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
        {time && <AppText style={styles.time}>{time}</AppText>}
      </Box>
      <AppText style={[styles.amount, isPositive && styles.amountPositive]}>
        {amount}
      </AppText>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontWeight: "500",
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  time: {
    fontWeight: "400",
    fontSize: typography.sizes.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.text,
    marginLeft: 8,
  },
  amountPositive: {
    color: Colors.success,
  },
});
